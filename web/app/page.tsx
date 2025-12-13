import Link from "next/link"
import { ArrowRight, Lock, MessageSquare, Smartphone } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-4 text-balance">Private Chat, Completely Encrypted</h1>
          <p className="text-xl text-slate-300 mb-8 text-balance">
            End-to-end encrypted messaging with QR login. Your messages, your keys, nobody else.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <Lock className="mb-4 text-blue-400" size={32} />
            <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
            <p className="text-slate-300">AES-256-GCM encryption. Only you and your contacts can read messages.</p>
          </div>

          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <Smartphone className="mb-4 text-blue-400" size={32} />
            <h3 className="text-xl font-bold mb-2">QR Login</h3>
            <p className="text-slate-300">Scan QR with mobile to instantly login without typing passwords.</p>
          </div>

          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <MessageSquare className="mb-4 text-blue-400" size={32} />
            <h3 className="text-xl font-bold mb-2">Offline Support</h3>
            <p className="text-slate-300">Messages queue when offline, automatically sync when back online.</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <p className="text-slate-300 mb-4">
            Built with Next.js, MongoDB, Redis, Web Crypto API, and JWT authentication
          </p>
          <div className="text-sm text-slate-400">
            All encryption happens client-side. Server only stores encrypted messages.
          </div>
        </div>
      </div>
    </main>
  )
}
