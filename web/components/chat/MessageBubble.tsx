import { DecryptedMessage } from "@/lib/types"

interface MessageBubbleProps {
  message: DecryptedMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="group">
      <div className="flex justify-end">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-lg">
              <p className="text-white text-base leading-relaxed">{message.text}</p>
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-blue-400/20">
                <span className="text-xs text-blue-100/80">{formatTime(message.sentAt)}</span>
              </div>
            </div>
            {/* Message tail */}
            <div className="absolute top-0 right-0 w-3 h-3 overflow-hidden">
              <div className="absolute -top-3 right-0 w-3 h-3 bg-blue-500 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}