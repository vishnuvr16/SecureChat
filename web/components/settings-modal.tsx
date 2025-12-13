"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Download, Upload, Settings, X, Loader2, Shield, Database, History, RefreshCw, AlertCircle, CheckCircle, User, Smartphone, Lock, Globe } from "lucide-react"
import { getMessages, saveMessages, markMessageAsSynced } from "@/lib/storage"
import type { CachedMessage } from "@/lib/storage"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'export' | 'import'

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [fileSelected, setFileSelected] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('export')
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')

  useEffect(() => {
    if (isOpen) {
      const messages = getMessages()
      setMessageCount(messages.length)
    }
  }, [isOpen])

  const handleTabChange = (tab: TabType) => {
    const currentIndex = ['export', 'import'].indexOf(activeTab)
    const newIndex = ['export', 'import'].indexOf(tab)
    setSlideDirection(newIndex > currentIndex ? 'left' : 'right')
    setActiveTab(tab)
  }

  const handleExport = () => {
  try {
    setExporting(true)
    const messages = getMessages()

    // Export encrypted messages as-is from storage
    const backup = {
      exportedAt: new Date().toISOString(),
      messages: messages.map((m: CachedMessage) => ({
        id: m.id,
        ciphertext: m.ciphertext,
        iv: m.iv,
        sentAt: m.sentAt.toISOString(),
        deviceId: m.deviceId,
        synced: m.synced,
        // No plaintext included
      })),
      metadata: {
        messageCount: messages.length,
        encryptionType: "AES-256-GCM",
        note: "This backup contains encrypted messages only."
      }
    }

    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `securechat-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Encrypted backup exported successfully")
  } catch (err) {
    toast.error("Export failed")
    console.error(err)
  } finally {
    setExporting(false)
  }
}

const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) {
    setFileSelected(false)
    return
  }

  setFileSelected(true)
  setImporting(true)
  const reader = new FileReader()

  reader.onload = async (event) => {
    try {
      const content = event.target?.result as string
      const backup = JSON.parse(content) as any

      const importedMessages: CachedMessage[] = []
      
      // Import each message from backup
      backup.messages.forEach((m: any) => {
        const message: CachedMessage = {
          id: m.id || `imported-${Date.now()}-${Math.random()}`,
          text: "", // We'll decrypt on display
          ciphertext: m.ciphertext,
          iv: m.iv,
          sentAt: new Date(m.sentAt),
          deviceId: m.deviceId || "imported",
          synced: m.synced || false, // Mark unsynced to sync with DB
        }
        
        importedMessages.push(message)
      })

      // Store in localStorage
      const currentMessages = getMessages()
      const messageMap = new Map<string, CachedMessage>()
      
      // Add current messages
      currentMessages.forEach(msg => {
        messageMap.set(msg.id, msg)
      })
      
      // Add imported messages (skip duplicates by id or ciphertext+iv)
      importedMessages.forEach(msg => {
        // Check for existing message by id
        const existingById = messageMap.get(msg.id)
        
        // Also check for duplicate ciphertext+iv combination
        const existingByCrypto = Array.from(messageMap.values()).find(
          m => m.ciphertext === msg.ciphertext && m.iv === msg.iv
        )
        
        if (!existingById && !existingByCrypto) {
          messageMap.set(msg.id, msg)
        }
      })
    
      const allMessages = Array.from(messageMap.values())
      saveMessages(allMessages)
      
      setMessageCount(allMessages.length)
      
      toast.success(`Imported ${importedMessages.length} encrypted messages`)
      
      // Sync to database in background
      if (importedMessages.length > 0) {
        syncImportedMessagesToDatabase(importedMessages)
      }
      
    } catch (err) {
      toast.error("Import failed: " + (err instanceof Error ? err.message : "Unknown error"))
      console.error(err)
    } finally {
      setImporting(false)
      setFileSelected(false)
      e.target.value = ''
    }
  }

  reader.readAsText(file)
}

// Sync imported messages to database
const syncImportedMessagesToDatabase = async (messages: CachedMessage[]) => {
  try {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      toast.warning("Not authenticated. Messages stored locally only.")
      return
    }

    let syncedCount = 0
    let failedCount = 0
    
    for (const msg of messages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-device-id': 'import'
          },
          body: JSON.stringify({
            ciphertext: msg.ciphertext,
            iv: msg.iv,
            sentAt: msg.sentAt.toISOString()
          })
        })

        if (response.ok) {
          const result = await response.json()
          if (!result.duplicate) {
            syncedCount++
            markMessageAsSynced(msg.id)
          }
        } else {
          failedCount++
          console.error(`Failed to sync message ${msg.id}: ${response.status}`)
        }
      } catch (syncErr) {
        failedCount++
        console.error("Sync error for message:", msg.id, syncErr)
      }
    }

    // Show results
    if (syncedCount > 0) {
      toast.success(`${syncedCount} messages synced to cloud`)
    }
    if (failedCount > 0) {
      toast.warning(`${failedCount} messages failed to sync (check connection)`)
    }
    
  } catch (error) {
    console.error("Database sync error:", error)
  }
}

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-start justify-center p-4 z-50 animate-in fade-in duration-300 overflow-y-auto py-8">
      <div className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative border border-gray-700/50 animate-in slide-in-from-bottom-8 duration-500 my-auto backdrop-blur-sm">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
        >
          <X size={20} className="text-gray-400 group-hover:text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings size={26} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Encrypted Backup</h1>
          <p className="text-sm text-gray-400">Export/import encrypted chat history</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex mb-6 border-b border-gray-700/50">
          {[
            { id: 'export', label: 'Export', icon: Download },
            { id: 'import', label: 'Import', icon: Upload },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all duration-300 relative ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="relative overflow-hidden min-h-[400px]">
          {/* Export Tab */}
          <div 
            className={`transition-all duration-500 ease-in-out absolute inset-0 ${
              activeTab === 'export' 
                ? 'translate-x-0 opacity-100' 
                : slideDirection === 'left' 
                  ? '-translate-x-full opacity-0' 
                  : 'translate-x-full opacity-0'
            }`}
          >
            <div className="p-1">
              {/* Security Banner */}
              <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Lock size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Encrypted Export</h3>
                    <p className="text-xs text-blue-300">
                      Your messages are exported in encrypted form. Only your device can decrypt them.
                      Plaintext is never included in the backup file.
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Section */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                      <Download size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Export Encrypted Backup</h2>
                      <p className="text-xs text-gray-400">Download encrypted chat history (AES-256)</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <span className="text-xs font-medium text-blue-400">Secure</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-4">
                  Download all your encrypted messages as a JSON file. This backup contains ciphertext and IV only.
                  Your master key is required to decrypt the messages.
                </p>
                
                <div className="bg-gray-900/50 rounded-lg p-3 mb-4 border border-gray-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-300">Backup Details</p>
                      <div className="flex flex-wrap gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Lock size={12} className="text-green-400" />
                          <span className="text-xs text-gray-400">AES-256 Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Shield size={12} className="text-blue-400" />
                          <span className="text-xs text-gray-400">No Plaintext</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Database size={12} className="text-purple-400" />
                          <span className="text-xs text-gray-400">JSON Format</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Encrypted Messages</p>
                      <p className="text-lg font-bold text-white">{messageCount}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleExport}
                  disabled={exporting || messageCount === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600/90 to-blue-700/90 hover:from-blue-600 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:cursor-not-allowed group"
                >
                  {exporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Exporting Encrypted Backup...
                    </>
                  ) : (
                    <>
                      <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
                      Export Encrypted Backup ({messageCount} messages)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Import Tab */}
          <div 
            className={`transition-all duration-500 ease-in-out absolute overflow-y-auto hide-scrollbar inset-0 ${
              activeTab === 'import' 
                ? 'translate-x-0 opacity-100' 
                : slideDirection === 'left' 
                  ? '-translate-x-full opacity-0' 
                  : 'translate-x-full opacity-0'
            }`}
          >
            <div className="p-1">
              {/* Security Banner */}
              <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Secure Import</h3>
                    <p className="text-xs text-green-300">
                      Import encrypted messages directly. Your current master key will be used to decrypt them.
                      Messages are stored as-is without re-encryption.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                    <Upload size={18} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Import Encrypted Backup</h2>
                    <p className="text-xs text-gray-400">Restore from encrypted backup file</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-4">
                  Restore encrypted messages from a previously exported backup. 
                  This will merge with your existing encrypted messages.
                </p>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={importing}
                    id="import-file"
                    className="hidden"
                  />
                  <label
                    htmlFor="import-file"
                    className={`block w-full cursor-pointer rounded-lg transition-all duration-200 ${
                      importing || fileSelected
                        ? 'bg-gradient-to-r from-green-600/90 to-emerald-700/90'
                        : 'bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-700 hover:to-gray-900 border border-gray-600/50 hover:border-green-500/30'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {importing ? (
                          <>
                            <Loader2 size={18} className="animate-spin text-white" />
                            <span className="text-sm font-medium text-white">Processing Encrypted Backup...</span>
                          </>
                        ) : fileSelected ? (
                          <>
                            <CheckCircle size={18} className="text-white" />
                            <span className="text-sm font-medium text-white">File Selected - Processing...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={18} className="text-gray-300" />
                            <span className="text-sm font-medium text-gray-300">Choose Encrypted Backup File</span>
                          </>
                        )}
                      </div>
                      {!importing && !fileSelected && (
                        <p className="text-xs text-gray-400 text-center mt-2">
                          Click to select an encrypted JSON backup file
                        </p>
                      )}
                    </div>
                  </label>
                </div>
                
                {/* Backup Versions Info */}
                <div className="mt-4 bg-gray-900/40 rounded-lg p-3 border border-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={14} className="text-blue-400" />
                    <p className="text-xs font-medium text-gray-300">Supported Backup Formats</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">Version 2.0 (Recommended)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock size={10} className="text-green-400" />
                        <span className="text-xs text-gray-400">Encrypted</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs text-gray-300">Version 1.0 (Legacy)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle size={10} className="text-yellow-400" />
                        <span className="text-xs text-gray-400">Plaintext</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Notes */}
                <div className="mt-4 bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
                  <div className="flex items-start gap-2">
                    <Shield size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-white mb-1">Important Security Notes</p>
                      <ul className="space-y-1 text-xs text-blue-300">
                        <li>• Encrypted backups require your current master key to decrypt</li>
                        <li>• Plaintext is never stored in the backup file</li>
                        <li>• Messages remain encrypted during import/export</li>
                        <li>• Keep your master key secure and backed up separately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-green-500" />
              <p className="text-xs text-gray-500">End-to-end encrypted</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-blue-500" />
              <p className="text-xs text-gray-500">Version 1.0 Backup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add CSS for hiding scrollbar
const style = document.createElement('style')
style.textContent = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`
document.head.appendChild(style)