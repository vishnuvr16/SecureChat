import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import crypto from "crypto"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "default-secret"
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret"
const ACCESS_TOKEN_EXPIRY = "15m"
const REFRESH_TOKEN_EXPIRY = "7d"

// get user from req
export function getUserFromRequest(request: NextRequest) {
  const header = request.headers.get("authorization")

  if (!header) return null

  const token = header.split(" ")[1] // safer than replace()

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return decoded
  } catch (err) {
    console.error("JWT decode failed:", err)
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

// Generate tokens
export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function generateRefreshToken(userId: string, sessionId: string): string {
  return jwt.sign({ userId, sessionId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

// Verify access token
export function verifyAccessToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch {
    return null
  }
}

export async function refreshAccessToken() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include", // VERY IMPORTANT
  })

  const data = await res.json()
  localStorage.setItem("accessToken", data.accessToken)
  return data.accessToken
}


// Verify refresh token
export function verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string; sessionId: string }
    return decoded
  } catch {
    return null
  }
}

// Generate refresh token hash for storage
export function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

// Verify refresh token hash
export async function verifyRefreshTokenHash(
  token: string,
  storedHash: string,
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const hash = hashRefreshToken(token)
  if (hash !== storedHash) return false

  const decoded = verifyRefreshToken(token)
  if (!decoded) return false

  return decoded.userId === userId && decoded.sessionId === sessionId
}
