"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { sendMessage, syncMessages } from "@/lib/sync"
import { getMessages, getMasterKey } from "@/lib/storage"
import type { DecryptedMessage } from "@/lib/types"
import { QRLoginModal } from "../qr-login"
import { SettingsModal } from "../settings-modal"
import { ChatHeader } from "./ChatHeader"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { useChat } from "@/hooks/useChat"

interface ChatInterfaceProps {
  user: { id: string; email: string; encryptionSalt: string }
  accessToken: string
}

export function ChatInterface({ user, accessToken }: ChatInterfaceProps) {
  const {
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
  } = useChat(user, accessToken)

  return (
    <>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <ChatHeader
          user={user}
          online={online}
          syncing={syncing}
          getInitials={getInitials}
          onSync={handleManualSync}
          onMobileLogin={() => setShowQRModal(true)}
          onSettings={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
        />

        <MessageList
          messages={messages}
          messagesEndRef={messagesEndRef}
          isEmpty={messages.length === 0}
        />

        <MessageInput
          input={input}
          setInput={setInput}
          loading={loading}
          keyLoaded={keyLoaded}
          masterKey={masterKey}
          online={online}
          onSend={handleSendMessage}
        />
      </div>

      <QRLoginModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  )
}