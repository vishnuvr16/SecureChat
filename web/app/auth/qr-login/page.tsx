"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QRCode from "qrcode"
import { toast } from "sonner"
import { Copy, RefreshCw, ArrowLeft, Loader2 } from "lucide-react"

export default function QRLoginPage() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState<string>("")
  const [qrToken, setQrToken] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const generateQR = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/auth/qr-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        const data = await response.json()
        if (!response.ok) {
          toast.error(data.error || "Failed to generate QR code")
          return
        }

        setQrToken(data.qrToken)

        // Generate QR code image with token and server URL
        const qrString = JSON.stringify({
          qrToken: data.qrToken,
          serverUrl: window.location.origin,
          type: "mobile-login",
        })

        const qrDataUrl = await QRCode.toDataURL(qrString, {
          errorCorrectionLevel: "H",
          type: "image/png",
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        })

        setQrCode(qrDataUrl)
      } catch (err) {
        toast.error("Failed to generate QR code")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  const handleRefresh = async () => {
    setTimeLeft(60)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/qr-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Failed to refresh QR code")
        return
      }

      setQrToken(data.qrToken)

      const qrString = JSON.stringify({
        qrToken: data.qrToken,
        serverUrl: window.location.origin,
        type: "mobile-login",
      })

      const qrDataUrl = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })

      setQrCode(qrDataUrl)
      toast.success("QR code refreshed")
    } catch (err) {
      toast.error("Failed to refresh QR code")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(qrToken)
    toast.success("Token copied to clipboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 max-w-md w-full">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/auth/login" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mobile Login</h1>
              <p className="text-sm text-gray-600">Scan with your phone</p>
            </div>
          </div>
        </div>

        {loading && !qrCode ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <img src={qrCode || "/placeholder.svg"} alt="QR Code for mobile login" className="w-64 h-64" />
            </div>

            {/* Timer and Refresh */}
            <div className="flex items-center justify-between px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-semibold text-blue-900">Expires in: {timeLeft}s</span>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded transition-colors"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {/* Token for manual entry */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Manual Token</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrToken}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-600"
                />
                <button
                  onClick={handleCopyToken}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  title="Copy token"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500">Share this token with your mobile app if QR scan fails</p>
            </div>

            {/* Instructions */}
            <div className="space-y-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-semibold text-amber-900">Instructions:</p>
              <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
                <li>Open the mobile app</li>
                <li>Tap on "Scan QR Code"</li>
                <li>Point camera at this QR code</li>
                <li>You'll be instantly logged in</li>
              </ol>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
