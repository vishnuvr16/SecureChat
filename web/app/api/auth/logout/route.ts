import { type NextRequest, NextResponse } from "next/server"
import { connectDB, Session } from "@/lib/db"
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

    await connectDB()

    // Delete all sessions for this user
    await Session.deleteMany({ userId: decoded.userId })

    const response = NextResponse.json({ success: true })
    response.cookies.delete("refreshToken")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
