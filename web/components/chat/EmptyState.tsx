import { Shield, Clock } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-xl border border-gray-700/50">
          <Shield className="w-12 h-12 text-gray-500" />
        </div>
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-lg"></div>
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Your secure chat is ready</h3>
      <p className="text-gray-400 text-base max-w-md">
        Start a private conversation. All messages are encrypted end-to-end.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>End-to-end encrypted</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Syncs across devices</span>
        </div>
      </div>
    </div>
  )
}