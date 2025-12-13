import { type NextRequest, NextResponse } from "next/server"
import { setQRToken } from "@/lib/redis"
import crypto from "crypto"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request)?.userId

    if(!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const qrToken = crypto.randomBytes(32).toString("hex")

    // Store QR token in Redis with 60-second TTL
    await setQRToken(qrToken, userId)

    return NextResponse.json({
      qrToken,
      email: "",
      success: true,
    })
  } catch (error) {
    console.error("QR Init error:", error)
    return NextResponse.json({ error: "QR generation failed" }, { status: 500 })
  }
}
