import Link from "next/link"
import { ArrowRight, Lock, MessageSquare, Smartphone, Shield, Key, Cloud, Cpu, Database, Globe, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Hero Section */}
        <div className="text-center mb-24 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-8">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-300">End-to-End Encrypted</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Private Chat
            </span>
            <br />
            <span className="text-white">Completely Encrypted</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Military-grade encryption meets modern design. Your conversations stay private— 
            <span className="text-blue-300 font-medium"> only you hold the keys</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/auth/register"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl font-semibold inline-flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
            >
              <span>Start Secure Chat</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl font-bold text-blue-400">256-bit</div>
              <div className="text-sm text-gray-400">AES-GCM</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl font-bold text-purple-400">Zero</div>
              <div className="text-sm text-gray-400">Knowledge</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl font-bold text-green-400">100%</div>
              <div className="text-sm text-gray-400">Client-side</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
              <div className="text-3xl font-bold text-cyan-400">Instant</div>
              <div className="text-sm text-gray-400">Sync</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">End-to-End Encryption</h3>
              <p className="text-gray-300 leading-relaxed">
                AES-256-GCM encryption ensures only you and your contacts can read messages. No backdoors, no compromises.
              </p>
            </div>
          </div>

          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">QR Instant Login</h3>
              <p className="text-gray-300 leading-relaxed">
                Scan QR with mobile to authenticate instantly. No passwords stored, no typing required.
              </p>
            </div>
          </div>

          <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-green-500/30 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Offline Support</h3>
              <p className="text-gray-300 leading-relaxed">
                Messages queue locally when offline, auto-sync when back online. Perfect for spotty connections.
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="relative p-10 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-sm">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-medium">
              Tech Stack
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Globe size={32} className="text-blue-400 mb-3" />
              <div className="font-semibold">Next.js 14</div>
              <div className="text-sm text-gray-400 mt-1">App Router</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Database size={32} className="text-green-400 mb-3" />
              <div className="font-semibold">MongoDB</div>
              <div className="text-sm text-gray-400 mt-1">Atlas</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Cpu size={32} className="text-red-400 mb-3" />
              <div className="font-semibold">Redis</div>
              <div className="text-sm text-gray-400 mt-1">Real-time</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Key size={32} className="text-yellow-400 mb-3" />
              <div className="font-semibold">Web Crypto</div>
              <div className="text-sm text-gray-400 mt-1">API</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Shield size={32} className="text-purple-400 mb-3" />
              <div className="font-semibold">JWT</div>
              <div className="text-sm text-gray-400 mt-1">Stateless</div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-white/10">
            <p className="text-lg text-gray-300 mb-4">
              All encryption happens <span className="text-green-400 font-semibold">client-side</span>. 
              Server only stores <span className="text-blue-400 font-semibold">encrypted blobs</span>.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>End-to-end encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Open source</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Self-hostable</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to secure your conversations?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands who trust our platform for private, encrypted messaging.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <Shield size={20} />
            Get Started For Free
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </main>
  )
}