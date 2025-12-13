import { RefreshCw, Loader2, Smartphone, Settings, LogOut, Shield } from "lucide-react"

interface ChatHeaderProps {
  user: { email: string }
  online: boolean
  syncing: boolean
  getInitials: (email: string) => string
  onSync: () => void
  onMobileLogin: () => void
  onSettings: () => void
  onLogout: () => void
}

export function ChatHeader({
  user,
  online,
  syncing,
  getInitials,
  onSync,
  onMobileLogin,
  onSettings,
  onLogout
}: ChatHeaderProps) {
  return (
    <div className="bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">SecureChat</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <p className="text-xs md:text-sm text-gray-300">
                {online ? 'Secured & Connected' : 'Offline - Messages queued'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          {/* User Profile */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(user.email)}
            </div>
            <div className="text-sm">
              <p className="font-medium text-white truncate max-w-[120px]">{user.email.split('@')[0]}</p>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={syncing}
            className="p-2.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 group"
            title="Sync messages"
          >
            {syncing ? (
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 text-gray-300 group-hover:text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
            )}
          </button>

          {/* Mobile Login */}
          <button
            onClick={onMobileLogin}
            className="p-2.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
            title="Login on Mobile"
          >
            <Smartphone className="w-5 h-5 text-gray-300 group-hover:text-blue-400" />
          </button>

          {/* Settings */}
          <button
            onClick={onSettings}
            className="p-2.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-300 group-hover:text-purple-400" />
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2.5 hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-300 group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}