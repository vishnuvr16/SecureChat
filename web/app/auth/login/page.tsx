"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, Key, Smartphone, Globe } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        toast.error(data.error)
        return
      }

      // Store access token
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("user", JSON.stringify(data.user))

      const crypto = window.crypto.subtle
      const encodedPassword = new TextEncoder().encode(password)
      const encodedSalt = new TextEncoder().encode(data.user.encryptionSalt)

      const masterKey = await crypto.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: encodedSalt,
          iterations: 100000,
        },
        await crypto.importKey("raw", encodedPassword, "PBKDF2", false, ["deriveBits"]),
        256,
      )

      // Convert master key to hex string and store in localStorage
      const keyStr = Array.from(new Uint8Array(masterKey))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      localStorage.setItem("master_key", keyStr)

      toast.success("Signed in successfully")
      router.push("/chat")
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Left side - Login Form */}
        <div className="flex-1 max-w-md order-2 lg:order-1">
          <div className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-700/50 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg">
                  <Key size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400">Sign in to your SecureChat account</p>
              </div>
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex gap-3 p-3 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg text-sm text-red-300">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur transition-all duration-300"></div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-300 text-white placeholder-gray-500 disabled:bg-gray-800/40"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur transition-all duration-300"></div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-300 text-white placeholder-gray-500 disabled:bg-gray-800/40"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff size={18} className="text-gray-400 hover:text-white" />
                        ) : (
                          <Eye size={18} className="text-gray-400 hover:text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Key size={18} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security Info */}
              <div className="mt-6 pt-5 border-t border-gray-700/50">
                <div className="flex items-start gap-2">
                  <Shield size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your encryption key is derived from your password and never leaves your device.
                  </p>
                </div>
              </div>

              {/* Register Link */}
              <p className="text-center text-gray-400 text-sm mt-6">
                Don't have an account?{" "}
                <Link 
                  href="/auth/register" 
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 inline-flex items-center gap-1"
                >
                  Create one
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Branding and Features */}
        <div className="flex-1 max-w-lg text-center lg:text-left space-y-8 order-1 lg:order-2">
          <div className="space-y-4 ">
            <div className="inline-flex mt-10 items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-6 py-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SecureChat</h2>
                <p className="text-sm text-gray-400">End-to-end Encrypted</p>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your Secure Messages
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Are Waiting
              </span>
            </h1>
            
            <p className="text-lg text-gray-300 max-w-lg">
              Sign in to continue your private conversations. Every message is end-to-end encrypted and never stored on our servers.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Shield className="w-5 h-5 text-green-400" />,
                title: "Military-grade Encryption",
                description: "AES-256-GCM encryption"
              },
              {
                icon: <Smartphone className="w-5 h-5 text-blue-400" />,
                title: "Cross-platform",
                description: "Web and mobile apps"
              },
              {
                icon: <Key className="w-5 h-5 text-purple-400" />,
                title: "Your Keys",
                description: "You control the encryption"
              },
              {
                icon: <Globe className="w-5 h-5 text-yellow-400" />,
                title: "Zero Knowledge",
                description: "We can't read your messages"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-800/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="space-y-3 pt-4">
            <h3 className="font-semibold text-white text-lg">Why Sign In?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Access your encrypted chat history</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Sync across all your devices securely</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Continue where you left off</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Your data never leaves your device</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}