"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, User, CheckCircle, Key } from "lucide-react"

interface AuthFormProps {
  type: "register" | "login"
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (type === "register") {
      checkPasswordStrength(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (type === "register" && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const endpoint = type === "register" ? "/api/auth/register" : "/api/auth/login"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || `${type === "register" ? "Registration" : "Login"} failed`)
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

      toast.success(`${type === "register" ? "Account created" : "Signed in"} successfully`)
      router.push("/chat")
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-gray-600"
    if (strength === 1) return "bg-red-500"
    if (strength === 2) return "bg-yellow-500"
    if (strength === 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const getStrengthText = (strength: number) => {
    if (strength === 0) return "Very Weak"
    if (strength === 1) return "Weak"
    if (strength === 2) return "Fair"
    if (strength === 3) return "Good"
    return "Strong"
  }

  const isRegister = type === "register"
  const title = isRegister ? "Create Account" : "Sign In"
  const submitText = isRegister ? "Create Account" : "Sign In"
  const toggleText = isRegister ? "Already have an account?" : "Need an account?"
  const toggleHref = isRegister ? "/auth/login" : "/auth/register"

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3 shadow-lg">
          {isRegister ? <User size={28} className="text-white" /> : <Shield size={28} className="text-white" />}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-400">
          {isRegister 
            ? "Join SecureChat for encrypted conversations" 
            : "Welcome back to your secure chat"}
        </p>
      </div>

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
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder={isRegister ? "Minimum 8 characters" : "Enter your password"}
                className="w-full pl-10 pr-10 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-300 text-white placeholder-gray-500 disabled:bg-gray-800/40"
                disabled={loading}
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

          {/* Password Strength Indicator (Register only) */}
          {isRegister && password.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Password strength</span>
                <span className={`font-medium ${
                  passwordStrength === 0 ? 'text-gray-400' :
                  passwordStrength === 1 ? 'text-red-400' :
                  passwordStrength === 2 ? 'text-yellow-400' :
                  passwordStrength === 3 ? 'text-blue-400' : 'text-green-400'
                }`}>
                  {getStrengthText(passwordStrength)}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength >= level ? getStrengthColor(passwordStrength) : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Password Requirements (Register only) */}
          {isRegister && (
            <div className="space-y-1.5 text-xs text-gray-400">
              <p>Password must contain:</p>
              <div className="grid grid-cols-2 gap-1 pl-1">
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span>8+ characters</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span>Uppercase letter</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span>Number</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span>Special character</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password (Register only) */}
        {isRegister && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-sm group-hover:blur transition-all duration-300"></div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-10 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 outline-none transition-all duration-300 text-white placeholder-gray-500 disabled:bg-gray-800/40"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} className="text-gray-400 hover:text-white" />
                  ) : (
                    <Eye size={18} className="text-gray-400 hover:text-white" />
                  )}
                </button>
              </div>
            </div>
            {password && confirmPassword && (
              <div className="flex items-center gap-1.5 text-xs">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle size={12} className="text-green-400" />
                    <span className="text-green-400">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} className="text-red-400" />
                    <span className="text-red-400">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              {isRegister ? <User size={18} /> : <Key size={18} />}
              <span>{submitText}</span>
            </>
          )}
        </button>
      </form>

      {/* Security Info */}
      <div className="mt-6 pt-5 border-t border-gray-700/50">
        <div className="flex items-start gap-2">
          <Shield size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-400 leading-relaxed">
            All data is encrypted end-to-end. Your encryption key is derived from your password and never leaves your device.
          </p>
        </div>
      </div>

      {/* Toggle Link */}
      <p className="text-center text-gray-400 text-sm mt-6">
        {toggleText}{" "}
        <Link 
          href={toggleHref} 
          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200 inline-flex items-center gap-1"
        >
          {isRegister ? "Sign in" : "Create one"}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </p>
    </div>
  )
}