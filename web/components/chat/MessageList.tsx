import { Shield, Clock } from "lucide-react"
import { DecryptedMessage } from "@/lib/types"
import { MessageBubble } from "./MessageBubble"
import { EmptyState } from "./EmptyState"

interface MessageListProps {
  messages: DecryptedMessage[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  isEmpty: boolean
}

export function MessageList({ messages, messagesEndRef, isEmpty }: MessageListProps) {
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex-1 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent pointer-events-none"></div>
      
      <div className="h-full overflow-y-auto px-4 md:px-6 py-4 md:py-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {/* Date Separator */}
              <div className="flex items-center justify-center my-6 md:my-8">
                <div className="px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50">
                  <span className="text-sm text-gray-400 font-medium">
                    Today, {formatDate()}
                  </span>
                </div>
              </div>

              {/* Messages */}
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}