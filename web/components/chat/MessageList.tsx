// MessageList.tsx
import { DecryptedMessage } from "@/lib/types"
import { MessageBubble } from "./MessageBubble"
import { EmptyState } from "./EmptyState"
import { useMemo } from "react"

interface MessageListProps {
  messages: DecryptedMessage[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  isEmpty: boolean
}

export function MessageList({ messages, messagesEndRef, isEmpty }: MessageListProps) {
  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: Record<string, DecryptedMessage[]> = {}
    
    messages.forEach(msg => {
      const date = new Date(msg.sentAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(msg)
    })
    
    return groups
  }, [messages])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto px-4 md:px-6 py-6 md:py-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto">
          {isEmpty ? (
            <EmptyState />
          ) : (
            <div className="space-y-1">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="sticky top-2 z-10 my-8 first:mt-0">
                    <div className="flex items-center justify-center">
                      <div className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {formatDate(dateMessages[0].sentAt.toString())}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-1">
                    {dateMessages.map((msg) => (
                      <MessageBubble 
                        key={msg.id} 
                        message={msg} 
                        // isFirstInGroup={dateMessages[0].id === msg.id}
                        // isLastInGroup={dateMessages[dateMessages.length - 1].id === msg.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} className="h-6 md:h-8" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}