export interface User {
  id: string
  email: string
  encryptionSalt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface Message {
  id: string
  ciphertext: string
  iv: string
  sentAt: Date
  deviceId: string
}

export interface DecryptedMessage {
  id: string
  text: string
  sentAt: Date
  deviceId: string
}

export interface Session {
  userId: string
  deviceId: string
  expiresAt: Date
}
