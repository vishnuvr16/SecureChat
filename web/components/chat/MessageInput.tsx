"use client"

import { useState, useRef } from "react"
import { Send, Loader2, Shield, Smile } from "lucide-react"
import { EmojiPicker } from "./EmojiPicker"

interface MessageInputProps {
  input: string
  setInput: (value: string) => void
  loading: boolean
  keyLoaded: boolean
  masterKey: ArrayBuffer | null
  online: boolean
  onSend: (e: React.FormEvent) => Promise<void>
}

export function MessageInput({
  input,
  setInput,
  loading,
  keyLoaded,
  masterKey,
  online,
  onSend
}: MessageInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const insertEmoji = (emoji: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const newInput = input.slice(0, cursorPosition) + emoji + input.slice(cursorPosition)
    setInput(newInput)
    
    setTimeout(() => {
      inputRef.current?.focus()
      const newPosition = cursorPosition + emoji.length
      inputRef.current?.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend(e)
    }
    if (e.key === 'Escape') {
      setShowEmojiPicker(false)
    }
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border-t border-gray-700/50 px-4 md:px-6 py-4">
      <form onSubmit={onSend} className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Emoji Button */}
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-3 rounded-xl transition-all duration-200 group flex-shrink-0 ${showEmojiPicker ? 'bg-blue-500/20' : 'hover:bg-gray-700/50'}`}
              title="Insert emoji"
            >
              <Smile className={`w-5 h-5 ${showEmojiPicker ? 'text-yellow-400' : 'text-gray-400 group-hover:text-yellow-400'}`} />
            </button>

            <EmojiPicker
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onSelect={insertEmoji}
            />
          </div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-sm"></div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={masterKey ? "Type your encrypted message here..." : "Loading secure encryption..."}
              disabled={loading || !keyLoaded}
              className="relative w-full px-5 py-3.5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none text-white placeholder-gray-500 disabled:bg-gray-900/40 disabled:cursor-not-allowed text-base transition-all duration-200"
            />
            {masterKey && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Shield className="w-4 h-4 text-green-400/70" />
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !input.trim() || !masterKey || !keyLoaded}
            className="px-5 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 group disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden md:inline">Send</span>
              </>
            )}
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-400">
                {online ? 'Encrypted & secure' : 'Offline - will sync when online'}
              </span>
            </div>
          </div>
          {input.length > 0 && (
            <div className="text-sm text-gray-500">
              {input.length}/1000
            </div>
          )}
        </div>
      </form>
    </div>
  )
}