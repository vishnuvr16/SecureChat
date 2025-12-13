import { type NextRequest, NextResponse } from "next/server"
import { connectDB, User, Session } from "@/lib/db"
import { comparePassword, generateAccessToken, generateRefreshToken, hashRefreshToken } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const passwordMatch = await comparePassword(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate tokens
    const deviceId = `web-${crypto.randomUUID()}`
    const sessionId = new mongoose.Types.ObjectId().toString()
    const refreshToken = generateRefreshToken(user._id.toString(), sessionId)
    const accessToken = generateAccessToken(user._id.toString())

    // console.log("[LOGIN] JWT_SECRET =", process.env.JWT_SECRET)

    // Store session
    await Session.create({
      _id: sessionId,
      userId: user._id,
      deviceId,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    const response = NextResponse.json(
      {
        accessToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          encryptionSalt: user.encryptionSalt,
        },
      },
      { status: 200 },
    )

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
