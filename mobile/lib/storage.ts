import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"

const MESSAGES_KEY = "chat_messages"
const MASTER_KEY_KEY = "master_key"
const LAST_SYNC_KEY = "last_sync"
const USER_KEY = "user_data"
const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"

export interface StoredMessage {
  id: string
  text: string
  ciphertext: string
  iv: string
  sentAt: string  // Always store as ISO string
  deviceId: string
  synced: boolean
}

export interface StoredUser {
  id: string
  email: string
  encryptionSalt: string
}

// ========== MESSAGES ==========

export async function getMessages(): Promise<StoredMessage[]> {
  try {
    const data = await AsyncStorage.getItem(MESSAGES_KEY)
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error("Failed to get messages:", err)
    return []
  }
}

export async function saveMessages(messages: StoredMessage[]): Promise<void> {
  try {
    // Ensure all sentAt are strings before storing
    const messagesToStore = messages.map(msg => ({
      ...msg,
      sentAt: typeof msg.sentAt === 'string' ? msg.sentAt : new Date(msg.sentAt).toISOString()
    }))
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messagesToStore))
  } catch (err) {
    console.error("Failed to save messages:", err)
  }
}

export async function addMessage(message: StoredMessage): Promise<void> {
  try {
    const messages = await getMessages()
    messages.push(message)
    await saveMessages(messages)
  } catch (err) {
    console.error("Failed to add message:", err)
  }
}

export async function clearMessages(): Promise<void> {
  try {
    await AsyncStorage.removeItem(MESSAGES_KEY)
  } catch (err) {
    console.error("Failed to clear messages:", err)
  }
}

export async function markMessageAsSynced(id: string): Promise<void> {
  try {
    const messages = await getMessages()
    const msg = messages.find((m) => m.id === id)
    if (msg) {
      msg.synced = true
      await saveMessages(messages)
    }
  } catch (err) {
    console.error("Failed to mark message as synced:", err)
  }
}

export async function getUnsyncedMessages(): Promise<StoredMessage[]> {
  const messages = await getMessages()
  return messages.filter((m) => !m.synced)
}

// ========== MASTER KEY ==========

let masterKeyInMemory: string | null = null

export function setMasterKey(key: string): void {
  masterKeyInMemory = key
}

export function getMasterKey(): ArrayBuffer | null {
  const bytes = masterKeyInMemory?.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) || []
  return new Uint8Array(bytes).buffer
}

export function clearMasterKey(): void {
  masterKeyInMemory = null
}

// ========== SYNC TIMESTAMP ==========

export async function setLastSync(timestamp: Date): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toISOString())
  } catch (err) {
    console.error("Failed to set last sync:", err)
  }
}

export async function getLastSync(): Promise<Date> {
  try {
    const data = await AsyncStorage.getItem(LAST_SYNC_KEY)
    return data ? new Date(data) : new Date(Date.now() - 24 * 60 * 60 * 1000)
  } catch (err) {
    console.error("Failed to get last sync:", err)
    return new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
}

// ========== USER ==========

export async function saveUser(user: StoredUser): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (err) {
    console.error("Failed to save user:", err)
  }
}

export async function getUser(): Promise<StoredUser | null> {
  try {
    const data = await AsyncStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error("Failed to get user:", err)
    return null
  }
}

export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(USER_KEY)
  } catch (err) {
    console.error("Failed to clear user:", err)
  }
}

// ========== TOKENS ==========

export async function saveAccessToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
  } catch (err) {
    console.error("Failed to save access token:", err)
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  } catch (err) {
    console.error("Failed to get access token:", err)
    return null
  }
}

export async function saveRefreshToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
  } catch (err) {
    console.error("Failed to save refresh token:", err)
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  } catch (err) {
    console.error("Failed to get refresh token:", err)
    return null
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
  } catch (err) {
    console.error("Failed to clear tokens:", err)
  }
}

// ========== CLEAR ALL ==========

export async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear()
    await clearTokens()
    clearMasterKey()
  } catch (err) {
    console.error("Failed to clear all storage:", err)
  }
}

// Helper to ensure sentAt is always a string
export function ensureSentAtIsString(message: any): StoredMessage {
  return {
    ...message,
    sentAt: typeof message.sentAt === 'string' 
      ? message.sentAt 
      : message.sentAt instanceof Date 
        ? message.sentAt.toISOString()
        : new Date().toISOString()
  }
}

// Helper to convert sentAt string to Date for display
export function messageForDisplay(message: StoredMessage): any {
  return {
    ...message,
    sentAt: new Date(message.sentAt)
  }
}