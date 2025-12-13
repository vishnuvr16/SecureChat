"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode"
import { toast } from "sonner"
import { Copy, RefreshCw, X, Loader2, Smartphone, Shield, Clock, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, QrCode, Key } from "lucide-react"

interface QRLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QRLoginModal({ isOpen, onClose }: QRLoginModalProps) {
  const [qrCode, setQrCode] = useState<string>("")
  const [qrToken, setQrToken] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(60)
  const [loading, setLoading] = useState(false)
  const [hasExpired, setHasExpired] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  useEffect(() => {
    if (isOpen) {
      resetModal()
      generateQR() // Generate QR in background
    }
  }, [isOpen])

  const resetModal = () => {
    setQrCode("")
    setQrToken("")
    setTimeLeft(60)
    setHasExpired(false)
    setLoading(false)
    setCopied(false)
    setCurrentStep(1)
  }

  // Countdown timer
  useEffect(() => {
    if (!isOpen || currentStep !== 2 || timeLeft <= 0) return

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isOpen, currentStep, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && !hasExpired) {
      setHasExpired(true)
      toast.warning("QR code has expired")
    }
  }, [timeLeft, hasExpired])

  const generateQR = async () => {
    setLoading(true)
    setTimeLeft(60)
    setHasExpired(false)
    try {
      const response = await fetch("/api/auth/qr-init", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          "Content-Type": "application/json" 
        },
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to generate QR code")
        return
      }

      setQrToken(data.qrToken)

      const masterKey = localStorage.getItem("master_key") || ""

      const qrString = JSON.stringify({
        token: data.qrToken,
        master: masterKey,
        baseUrl: "http://10.117.159.156:3000/api",
        type: "mobile-login",
        timestamp: Date.now(),
      })

      const qrDataUrl = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 280,
        margin: 2,
        color: {
          dark: "#ffffff",
          light: "#111827",
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

  const handleRefresh = async () => {
    await generateQR()
    toast.success("QR code refreshed")
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(qrToken)
    setCopied(true)
    toast.success("Token copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!qrCode || hasExpired) {
        toast.info("Generating QR code...")
        generateQR()
      }
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start justify-center p-4 z-50 animate-in fade-in duration-300 overflow-y-auto py-8">
      <div className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 rounded-2xl shadow-2xl p-6 max-w-lg w-full relative border border-gray-700/50 animate-in slide-in-from-bottom-8 duration-500 my-auto backdrop-blur-sm">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
        >
          <X size={20} className="text-gray-400 group-hover:text-white" />
        </button>

        {/* Progress steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 ${currentStep === 1 ? 'opacity-100' : 'opacity-70'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 1 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <Smartphone size={16} />
              </div>
              <span className="text-sm font-medium text-gray-300">Instructions</span>
            </div>

            {/* Connector line */}
            <div className="w-12 h-0.5 bg-gray-700/50 mx-2"></div>

            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${currentStep === 2 ? 'opacity-100' : 'opacity-70'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 2 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                <QrCode size={16} />
              </div>
              <span className="text-sm font-medium text-gray-300">Scan Code</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white mb-1">
            {currentStep === 1 ? "Mobile Login Instructions" : "Scan QR Code"}
          </h1>
          <p className="text-sm text-gray-400">
            {currentStep === 1 
              ? "Follow these steps to login on your mobile device" 
              : "Scan this QR code with your mobile app"}
          </p>
        </div>

        {/* Content based on current step */}
        <div className="space-y-6">
          {currentStep === 1 ? (
            /* Step 1: Instructions */
            <div className="space-y-6">
              {/* Security Info */}
              {/* <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                      <Shield size={18} className="text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Secure Device Pairing</h3>
                    <p className="text-sm text-gray-400">
                      Your chat history and encryption keys will be securely synced between devices.
                      All data remains end-to-end encrypted.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Instructions Steps */}
              <div className="space-y-4">
                <h3 className="font-medium text-white mb-3">Follow These Steps:</h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      step: 1,
                      icon: <Smartphone size={18} className="text-blue-400" />,
                      title: "Open Mobile App",
                      description: "Launch SecureChat on your mobile",
                      bgColor: "from-blue-500/10 to-blue-600/10",
                      borderColor: "border-blue-500/20"
                    },
                    {
                      step: 2,
                      icon: <QrCode size={18} className="text-purple-400" />,
                      title: "Tap QR Scanner",
                      description: 'Find "Scan QR Code" in app',
                      bgColor: "from-purple-500/10 to-purple-600/10",
                      borderColor: "border-purple-500/20"
                    },
                    {
                      step: 3,
                      icon: <Shield size={18} className="text-green-400" />,
                      title: "Scan Code",
                      description: "Point camera at QR code",
                      bgColor: "from-green-500/10 to-emerald-600/10",
                      borderColor: "border-green-500/20"
                    },
                    {
                      step: 4,
                      icon: <CheckCircle size={18} className="text-yellow-400" />,
                      title: "Auto Login",
                      description: "Login automatically completes",
                      bgColor: "from-yellow-500/10 to-amber-600/10",
                      borderColor: "border-yellow-500/20"
                    }
                  ].map((item) => (
                    <div 
                      key={item.step}
                      className={`bg-gradient-to-br ${item.bgColor} backdrop-blur-sm rounded-xl p-4 border ${item.borderColor} hover:scale-[1.02] transition-all duration-300 group`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-800/60 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500">Step {item.step}</span>
                          </div>
                          <h4 className="font-medium text-white text-sm mb-1 truncate">{item.title}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <AlertCircle size={14} className="text-yellow-500" />
                  Requirements
                </h4>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Mobile app must be the same version as web app
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Both devices must be connected to the internet
                  </li>
                  <li className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    QR codes expire in 60 seconds for security
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* Step 2: QR Code */
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                      <div className="relative">
                        <Loader2 size={32} className="animate-spin text-blue-400" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm text-gray-300">Generating secure QR code</p>
                        <p className="text-xs text-gray-500 mt-1">Please wait...</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : qrCode && !hasExpired ? (
                <>
                  {/* QR Code with border animation */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/30 to-purple-600/30 blur-xl"></div>
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700/50 shadow-xl p-4">
                      <div className="flex justify-center p-2">
                        <img 
                          src={qrCode} 
                          alt="QR Code for mobile login" 
                          className="w-64 h-64 rounded-lg"
                        />
                      </div>
                      
                      {/* Timer */}
                      <div className="flex items-center justify-center mt-3 space-x-2">
                        <Clock size={14} className={`${timeLeft < 10 ? 'text-red-400' : 'text-blue-400'}`} />
                        <span className={`text-xs font-semibold ${
                          timeLeft < 10 ? 'text-red-400 animate-pulse' : timeLeft < 30 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {timeLeft}s remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Token section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Key size={14} className="text-blue-400" />
                        Manual Token
                      </label>
                      <button
                        onClick={handleCopyToken}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs ${
                          copied 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white border-gray-600/50'
                        } border rounded-lg transition-all duration-200`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle size={12} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-sm"></div>
                      <input
                        type="text"
                        value={qrToken}
                        readOnly
                        className="relative w-full px-3 py-2.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs font-mono text-gray-300 pr-20 truncate"
                      />
                    </div>
                    <p className="text-xs text-gray-500 px-1">
                      Use this token in the mobile app if QR scanning fails
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-600 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:cursor-not-allowed group"
                    >
                      <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
                      Refresh QR
                    </button>
                  </div>
                </>
              ) : (
                /* Expired state */
                <div className="text-center py-6 space-y-6">
                  <div className="relative">
                    <div className="w-64 h-64 mx-auto rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 border-dashed flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative inline-flex mb-3">
                          <AlertCircle size={48} className="text-red-400/70" />
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full blur-lg"></div>
                        </div>
                        <p className="font-medium text-sm text-gray-300">QR Code Expired</p>
                        <p className="text-xs text-gray-500 mt-1">Generate a new code to continue</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={generateQR}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-600 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] group"
                  >
                    <RefreshCw size={16} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
                    Generate New QR Code
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700/50">
            {currentStep === 2 && (
              <button
                onClick={handlePrevStep}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/10 active:scale-[0.98] group"
              >
                <ChevronLeft size={16} />
                Back to Instructions
              </button>
            )}
            
            {currentStep === 1 && (
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="flex-1 flex items-center cursor-pointer justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-600 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to QR Code
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              <Shield size={14} className="text-green-400" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              QR codes include encrypted session data that expires after 60 seconds.
              Your encryption keys are never transmitted over the network.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}