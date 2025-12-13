import { type NextRequest, NextResponse } from "next/server"
import { connectDB, User } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { generateSalt } from "@/lib/crypto"
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/auth"
import { Session } from "@/lib/db"
import mongoose from "mongoose" // Declare the mongo variable

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid email or password (min 8 chars)" }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password and create salt
    const passwordHash = await hashPassword(password)
    const encryptionSalt = generateSalt()

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      encryptionSalt,
    })

    // Generate session
    const deviceId = `web-${crypto.randomUUID()}`
    const sessionId = new mongoose.Types.ObjectId().toString() // Use mongoose instead of mongo
    const refreshToken = generateRefreshToken(user._id.toString(), sessionId)
    const accessToken = generateAccessToken(user._id.toString())

    // Store session
    await Session.create({
      _id: sessionId,
      userId: user._id,
      deviceId,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    // Set refresh token cookie
    const response = NextResponse.json(
      {
        accessToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          encryptionSalt: user.encryptionSalt,
        },
      },
      { status: 201 },
    )

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
