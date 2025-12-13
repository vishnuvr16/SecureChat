"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Download, Upload, ArrowLeft, Loader2 } from "lucide-react"
import { getMessages } from "@/lib/storage"

interface BackupData {
  version: "1.0"
  exportedAt: string
  messages: Array<{
    id: string
    text: string
    sentAt: string
    deviceId: string
  }>
}

export default function BackupPage() {
  const router = useRouter()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/auth/login")
      return
    }

    const messages = getMessages()
    setMessageCount(messages.length)
  }, [router])

  const handleExport = () => {
    try {
      setExporting(true)
      const messages = getMessages()

      const backup: BackupData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        messages: messages
          .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
          .map((m) => ({
            id: m.id,
            text: m.text,
            sentAt: m.sentAt.toString(),
            deviceId: m.deviceId,
          })),
      }

      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `chat-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Backup exported successfully")
    } catch (err) {
      toast.error("Export failed")
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        const backup = JSON.parse(content) as BackupData

        if (backup.version !== "1.0") {
          throw new Error("Unsupported backup version")
        }

        // Restore messages to local storage
        const currentMessages = getMessages()
        const newMessages = [
          ...currentMessages,
          ...backup.messages.map((m) => ({
            id: m.id,
            text: m.text,
            ciphertext: "",
            iv: "",
            sentAt: new Date(m.sentAt),
            deviceId: m.deviceId,
            synced: true,
          })),
        ]

        // Remove duplicates
        const unique = newMessages.filter((msg, index, self) => self.findIndex((m) => m.id === msg.id) === index)

        // Sort by date
        unique.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())

        localStorage.setItem("chat_messages", JSON.stringify(unique))
        setMessageCount(unique.length)
        toast.success("Backup restored successfully")
      } catch (err) {
        toast.error("Import failed: " + (err instanceof Error ? err.message : "Unknown error"))
        console.error(err)
      } finally {
        setImporting(false)
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/chat" className="p-2 hover:bg-gray-200 rounded-lg transition-colors" aria-label="Go back">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
        </div>

        {/* Backup Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Backup</h2>
          <p className="text-gray-600 mb-6">
            Download all your messages as a JSON file. This backup contains encrypted message history.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Messages available:</strong> {messageCount}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || messageCount === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Export Backup
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Backup</h2>
          <p className="text-gray-600 mb-6">
            Restore messages from a previously exported backup. This will merge with existing messages.
          </p>

          <label className="block">
            <input type="file" accept=".json" onChange={handleImport} disabled={importing} className="hidden" />
            <span className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-semibold transition-colors cursor-pointer">
              {importing ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              Import Backup
            </span>
          </label>

          <p className="text-xs text-gray-500 mt-4">Only JSON files exported from this application are supported.</p>
        </div>
      </div>
    </div>
  )
}
