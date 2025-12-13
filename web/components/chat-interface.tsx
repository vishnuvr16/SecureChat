"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Send, LogOut, Settings, Wifi, WifiOff, RefreshCw, Loader2, Smartphone, User, Shield, Clock, Smile, X } from "lucide-react"
import { sendMessage, syncMessages } from "@/lib/sync"
import { getMessages, getMasterKey } from "@/lib/storage"
import type { DecryptedMessage } from "@/lib/types"
import { QRLoginModal } from "./qr-login"
import { SettingsModal } from "./settings-modal"

interface ChatInterfaceProps {
  user: { id: string; email: string; encryptionSalt: string }
  accessToken: string
}

// Common emojis for quick selection
const commonEmojis = [
  "😀", "😂", "😊", "🥰", "😎", "🤔", "😮", "👍", "👋", "❤️",
  "🔥", "⭐", "🎉", "🙏", "💯", "🤣", "😍", "😭", "😅", "👏",
  "🙌", "😘", "🥺", "😋", "🤩", "🤗", "😇", "🥳", "🤪", "😜"
]

export function ChatInterface({ user, accessToken }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [online, setOnline] = useState(true)
  const [masterKey, setMasterKey] = useState<ArrayBuffer | null>(null)
  const [keyLoaded, setKeyLoaded] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages from local storage
  useEffect(() => {
    const cached = getMessages()
    const decrypted = cached.map((m) => ({
      id: m.id,
      text: m.text,
      sentAt: new Date(m.sentAt),
      deviceId: m.deviceId,
    }))
    setMessages(decrypted.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()))
  }, [])

  // Load master key from localStorage
  useEffect(() => {
    const key = getMasterKey()
    setMasterKey(key)
    setKeyLoaded(true)
  }, [])

  // Setup online/offline detection
  useEffect(() => {
    setOnline(navigator.onLine)
    window.addEventListener("online", () => setOnline(true))
    window.addEventListener("offline", () => setOnline(false))

    return () => {
      window.removeEventListener("online", () => setOnline(true))
      window.removeEventListener("offline", () => setOnline(false))
    }
  }, [])

  // Auto-sync on mount and periodically
  useEffect(() => {
    if (!keyLoaded || !masterKey) return

    const performSync = async () => {
      try {
        setSyncing(true)
        await syncMessages(accessToken, user, masterKey)
        const cached = getMessages()
        const decrypted = cached.map((m) => ({
          id: m.id,
          text: m.text,
          sentAt: new Date(m.sentAt),
          deviceId: m.deviceId,
        }))
        setMessages(decrypted.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()))
      } catch (err) {
        console.error("Sync failed:", err)
        toast.error("Sync failed: " + (err instanceof Error ? err.message : "Unknown error"))
      } finally {
        setSyncing(false)
      }
    }

    performSync()

    // Sync every 30 seconds
    const interval = setInterval(performSync, 30000)
    return () => clearInterval(interval)
  }, [accessToken, user, keyLoaded, masterKey])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !masterKey) return

    setLoading(true)
    try {
      const result = await sendMessage(input, accessToken, masterKey)
      setMessages((prev) => [
        ...prev,
        {
          id: result.id,
          text: input,
          sentAt: result.sentAt,
          deviceId: "web",
        },
      ])
      setInput("")
      toast.success("Message sent")
      setShowEmojiPicker(false) // Close emoji picker after sending
    } catch (err) {
      console.error("Send failed:", err)
      toast.error("Failed to send message (will retry when online)")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      })
      localStorage.clear()
      window.location.href = "/auth/login"
    } catch (err) {
      toast.error("Logout failed")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const insertEmoji = (emoji: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const newInput = input.slice(0, cursorPosition) + emoji + input.slice(cursorPosition)
    setInput(newInput)
    
    // Focus back on input and set cursor position after the emoji
    setTimeout(() => {
      inputRef.current?.focus()
      const newPosition = cursorPosition + emoji.length
      inputRef.current?.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SecureChat</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <p className="text-xs text-gray-300">
                    {online ? 'Secured & Connected' : 'Offline - Messages queued'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* User Profile */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-700/50 rounded-xl">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {getInitials(user.email)}
                </div>
                <div className="text-xs">
                  <p className="font-medium text-white truncate max-w-[100px]">{user.email.split('@')[0]}</p>
                </div>
              </div>

              {/* Sync Button */}
              <button
                onClick={async () => {
                  setSyncing(true)
                  try {
                    if (!masterKey) throw new Error("Master key not available")
                    await syncMessages(accessToken, user, masterKey)
                    const cached = getMessages()
                    const decrypted = cached.map((m) => ({
                      id: m.id,
                      text: m.text,
                      sentAt: new Date(m.sentAt),
                      deviceId: m.deviceId,
                    }))
                    setMessages(decrypted.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime()))
                    toast.success("Messages synced")
                  } catch (err) {
                    toast.error("Sync failed")
                  } finally {
                    setSyncing(false)
                  }
                }}
                disabled={syncing}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 group relative"
                title="Sync messages"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-gray-300 group-hover:text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
                )}
              </button>

              {/* Mobile Login */}
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group relative"
                title="Login on Mobile"
              >
                <Smartphone className="w-4 h-4 text-gray-300 group-hover:text-blue-400" />
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group relative"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-gray-300 group-hover:text-purple-400" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 group relative"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-300 group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden relative">
          {/* Gradient Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent pointer-events-none"></div>
          
          <div className="h-full overflow-y-auto px-3 sm:px-4 py-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="max-w-3xl mx-auto space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-xl border border-gray-700/50">
                      <Shield className="w-10 h-10 text-gray-500" />
                    </div>
                    <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-lg"></div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1.5">Your secure chat is ready</h3>
                  <p className="text-gray-400 text-sm max-w-md">
                    Start a private conversation. All messages are encrypted end-to-end.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>End-to-end encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Syncs across devices</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-6">
                    <div className="px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50">
                      <span className="text-xs text-gray-400 font-medium">
                        Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  {messages.map((msg) => (
                    <div key={msg.id} className="group">
                      <div className="flex justify-end">
                        <div className="max-w-[85%] sm:max-w-[75%]">
                          <div className="relative">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg rounded-tr-none shadow-lg">
                              <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                              <div className="flex items-center justify-end gap-1.5 mt-1.5 pt-1.5 border-t border-blue-400/20">
                                <span className="text-xs text-blue-100/80">{formatTime(msg.sentAt)}</span>
                              </div>
                            </div>
                            {/* Message tail */}
                            <div className="absolute top-0 right-0 w-2 h-2 overflow-hidden">
                              <div className="absolute -top-2 right-0 w-2 h-2 bg-blue-500 transform rotate-45"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-800/80 backdrop-blur-xl border-t border-gray-700/50 px-3 sm:px-4 py-3">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              {/* Emoji Button */}
              <div className="relative" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-lg transition-all duration-200 group flex-shrink-0 ${showEmojiPicker ? 'bg-blue-500/20' : 'hover:bg-gray-700/50'}`}
                  title="Insert emoji"
                >
                  <Smile className={`w-4 h-4 ${showEmojiPicker ? 'text-yellow-400' : 'text-gray-400 group-hover:text-yellow-400'}`} />
                </button>

                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl p-3 w-64">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700/50">
                        <h4 className="text-xs font-semibold text-gray-300">Emojis</h4>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                          title="Close"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 text-lg hover:scale-110 active:scale-95"
                            title={`Insert ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-700/50">
                        <p className="text-xs text-gray-400 text-center">
                          Click an emoji to insert
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Field */}
              <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-sm"></div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={masterKey ? "Type your encrypted message here..." : "Loading secure encryption..."}
                  disabled={loading || !keyLoaded}
                  className="relative w-full px-4 py-2.5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none text-white placeholder-gray-500 disabled:bg-gray-900/40 disabled:cursor-not-allowed text-sm transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowEmojiPicker(false)
                    }
                  }}
                />
                {masterKey && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Shield className="w-3.5 h-3.5 text-green-400/70" />
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading || !input.trim() || !masterKey || !keyLoaded}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5 group disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline text-sm">Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-400">
                    {online ? 'Encrypted & secure' : 'Offline - will sync when online'}
                  </span>
                </div>
              </div>
              {input.length > 0 && (
                <div className="text-xs text-gray-500">
                  {input.length}/1000
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* QR Login Modal */}
      {showQRModal && (
        <QRLoginModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  )
}