import { type NextRequest, NextResponse } from "next/server"
import { connectDB, Message } from "@/lib/db"
import { verifyAccessToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }
    const decoded = verifyAccessToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const timestamp = request.nextUrl.searchParams.get("timestamp")
    if (!timestamp) {
      return NextResponse.json({ error: "Timestamp required" }, { status: 400 })
    }

    await connectDB()

    const messages = await Message.find({
      userId: decoded.userId,
      // createdAt: { $gt: new Date(timestamp) },
    }).sort({ sentAt: 1 })

    return NextResponse.json({
      messages: messages.map((msg: any) => ({
        id: msg._id.toString(),
        ciphertext: msg.ciphertext,
        iv: msg.iv,
        sentAt: msg.sentAt,
        deviceId: msg.deviceId,
      })),
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
