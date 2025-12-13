import { type NextRequest, NextResponse } from "next/server"
import { verifyRefreshToken, generateAccessToken, hashRefreshToken } from "@/lib/auth"
import { connectDB, Session } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value
    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 })
    }

    const decoded = verifyRefreshToken(refreshToken)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    await connectDB()

    // Verify session exists
    const session = await Session.findOne({
      userId: decoded.userId,
      refreshTokenHash: hashRefreshToken(refreshToken),
    })

    if (!session || new Date() > session.expiresAt) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    const newAccessToken = generateAccessToken(decoded.userId)

    return NextResponse.json(
      {
        accessToken: newAccessToken,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Refresh error:", error)
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 })
  }
}
