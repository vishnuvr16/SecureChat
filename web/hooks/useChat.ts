"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { sendMessage, syncMessages } from "@/lib/sync"
import { getMessages, getMasterKey } from "@/lib/storage"
import type { DecryptedMessage } from "@/lib/types"

export function useChat(user: { id: string; email: string; encryptionSalt: string }, accessToken: string) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [online, setOnline] = useState(true)
  const [masterKey, setMasterKey] = useState<ArrayBuffer | null>(null)
  const [keyLoaded, setKeyLoaded] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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

  const handleManualSync = async () => {
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
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return {
    messages,
    setMessages,
    input,
    setInput,
    loading,
    setLoading,
    syncing,
    setSyncing,
    online,
    masterKey,
    keyLoaded,
    showQRModal,
    setShowQRModal,
    showSettingsModal,
    setShowSettingsModal,
    messagesEndRef,
    handleSendMessage,
    handleLogout,
    handleManualSync,
    getInitials
  }
}