"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat"
import { getMasterKey } from "@/lib/storage"
import type { User } from "@/lib/types"

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    const token = localStorage.getItem("accessToken")
    const masterKey = getMasterKey()

    if (!userStr || !token) {
      router.push("/auth/login")
      return
    }

    try {
      setUser(JSON.parse(userStr))
      setAccessToken(token)
    } catch {
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading || !user || !accessToken) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return <ChatInterface user={user} accessToken={accessToken} />
}
