import { getAccessToken, saveAccessToken } from "./storage"

const API_BASE = "http://10.117.159.156:3000/api"

interface ApiResponse<T> {
  data?: T
  error?: string
}

interface QRLoginPayload {
  token: string
}

interface QRLoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    encryptionSalt: string
  }
}

interface SendMessagePayload {
  ciphertext: string
  iv: string
  sentAt: string
}

interface SendMessageResponse {
  id: string
  sentAt: string
}

interface Message {
  id: string
  ciphertext: string
  iv: string
  sentAt: string
  deviceId: string
}

interface MessagesResponse {
  messages: Message[]
}

export async function refreshAccessToken(): Promise<string> {
  const accessToken = await getAccessToken()
  if (!accessToken) throw new Error("No access token")
    console.log("Refreshing access token...",accessToken);
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
  console.log("refreshAccessToken response status:", response);

  if (!response.ok) {
    throw new Error("Token refresh failed")
  }

  const data = (await response.json()) as { accessToken: string }
  await saveAccessToken(data.accessToken)
  return data.accessToken
}

// QR Login
export async function qrLogin(qrToken: string,master: string): Promise<QRLoginResponse> {
  console.log("qrLogin called with token:", qrToken);
  console.log("api", API_BASE);
  const response = await fetch(`${API_BASE}/auth/qr-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: qrToken, masterKey: master }),
  })
  console.log("response", response);
  if (!response.ok) {
    throw new Error("QR login failed")
  }

  return response.json()
}

// Send message
export async function sendMessage(payload: SendMessagePayload): Promise<SendMessageResponse> {
  let accessToken = await getAccessToken()
  if (!accessToken) throw new Error("No access token")

  let response = await fetch(`${API_BASE}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-device-id": "mobile",
    },
    body: JSON.stringify(payload),
  })

  // If 401, refresh token and retry
  if (response.status === 401) {
    accessToken = await refreshAccessToken()
    response = await fetch(`${API_BASE}/messages/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "x-device-id": "mobile",
      },
      body: JSON.stringify(payload),
    })
  }

  if (!response.ok) {
    throw new Error("Failed to send message")
  }

  return response.json()
}

// Fetch messages since timestamp
export async function getMessagesSince(timestamp: string): Promise<MessagesResponse> {
  let accessToken = await getAccessToken()
  if (!accessToken) throw new Error("No access token")

  let response = await fetch(`${API_BASE}/messages/since?timestamp=${encodeURIComponent(timestamp)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-device-id": "mobile",
    },
  })

  // If 401, refresh token and retry
  if (response.status === 401) {
    console.log("Access token expired, refreshing...")
    accessToken = await refreshAccessToken()
    console.log("Retrying fetch messages with new access token")
    response = await fetch(`${API_BASE}/messages/since?timestamp=${encodeURIComponent(timestamp)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-device-id": "mobile",
      },
    })
  }

  if (!response.ok) {
    throw new Error("Failed to fetch messages")
  }

  return response.json()
}

// Logout
export async function logout(): Promise<void> {
  const accessToken = await getAccessToken()
  if (!accessToken) return

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  } catch (err) {
    console.error("Logout API call failed:", err)
  }
}
