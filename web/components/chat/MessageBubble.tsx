import { DecryptedMessage } from "@/lib/types"
import { Check } from "lucide-react"

interface MessageBubbleProps {
  message: DecryptedMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isOutgoing = message.deviceId === "web" // unchanged

  return (
    <div className={`mb-3 ${isOutgoing ? "flex justify-end" : "flex justify-start"}`}>
      <div className={`max-w-[85%] md:max-w-[70%]`}>
        {/* Message Bubble */}
        <div
          className={`
            px-4 py-2.5 rounded-2xl
            text-sm leading-relaxed break-words
            shadow-sm
            ${isOutgoing
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-gray-800 text-gray-100 rounded-bl-md"
            }
          `}
        >
          <p>{message.text}</p>

          {/* Footer */}
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span
              className={`text-[11px] ${
                isOutgoing ? "text-blue-100/80" : "text-gray-400"
              }`}
            >
              {formatTime(message.sentAt)}
            </span>

            {isOutgoing && (
              <Check size={14} className="opacity-80 text-blue-100/80" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
