import { type NextRequest, NextResponse } from "next/server"
import { getQRToken, deleteQRToken } from "@/lib/redis"
import { connectDB, User, Session } from "@/lib/db"
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const { token, masterKey } = await request.json()
    console.log("Received QR login request with token:", token, "and masterKey:", masterKey)
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }
    console.log("QR login attempt with token:", token, "and masterKey:", masterKey)
    // Verify QR token from Redis
    const qrData = await getQRToken(token)
    console.log("QR token data from:", qrData)
    if (!qrData) {
      return NextResponse.json({ error: "Invalid or expired QR token" }, { status: 401 })
    }

    console.log("QR token data retrieved:", qrData)

    await connectDB()

    const user = await User.findById(qrData.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("user found for QR login:", user)

    // Create new session for mobile device
    const deviceId = "mobile"
    const sessionId = new mongoose.Types.ObjectId().toString()
    const refreshToken = generateRefreshToken(user._id.toString(), sessionId)
    const accessToken = generateAccessToken(user._id.toString())

    await Session.create({
      userId: user._id,
      deviceId,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    // Delete QR token
    await deleteQRToken(token)

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        encryptionSalt: user.encryptionSalt,
      },
    })
  } catch (error) {
    console.error("QR Login error:", error)
    return NextResponse.json({ error: "QR login failed" }, { status: 500 })
  }
}
