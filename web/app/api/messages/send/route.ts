import { type NextRequest, NextResponse } from "next/server"
import { connectDB, Message } from "@/lib/db"
import { verifyAccessToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    const { ciphertext, iv, sentAt } = await request.json()

    if (!ciphertext || !iv || !sentAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const deviceId = request.headers.get("x-device-id") || "web"
    const sentAtDate = new Date(sentAt)

    // Check for duplicates before creating
    // Option 1: Check by ciphertext + iv + timestamp (within a time window)
    const existingMessage = await Message.findOne({
      userId: decoded.userId,
      ciphertext,
      iv,
      sentAt: {
        $gte: new Date(sentAtDate.getTime() - 5000), // 5 seconds before
        $lte: new Date(sentAtDate.getTime() + 5000), // 5 seconds after
      },
    })

    if (existingMessage) {
      // Message already exists, return the existing one
      return NextResponse.json(
        {
          id: existingMessage._id.toString(),
          sentAt: existingMessage.sentAt,
          duplicate: true,
        },
        { status: 200 },
      )
    }

    // Option 2: Additional check - prevent rapid duplicate messages from same device
    // (Useful if same message is sent multiple times quickly)
    const recentDuplicateFromSameDevice = await Message.findOne({
      userId: decoded.userId,
      deviceId,
      sentAt: {
        $gte: new Date(sentAtDate.getTime() - 2000), // Last 2 seconds
        $lte: sentAtDate,
      },
    }).sort({ sentAt: -1 })

    if (
      recentDuplicateFromSameDevice &&
      recentDuplicateFromSameDevice.ciphertext === ciphertext &&
      recentDuplicateFromSameDevice.iv === iv
    ) {
      return NextResponse.json(
        {
          id: recentDuplicateFromSameDevice._id.toString(),
          sentAt: recentDuplicateFromSameDevice.sentAt,
          duplicate: true,
        },
        { status: 200 },
      )
    }

    // Create new message
    const message = await Message.create({
      userId: decoded.userId,
      deviceId,
      ciphertext,
      iv,
      sentAt: sentAtDate,
    })

    return NextResponse.json(
      {
        id: message._id.toString(),
        sentAt: message.sentAt,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}