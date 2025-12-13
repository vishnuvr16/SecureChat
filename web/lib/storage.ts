// Local storage helpers for offline-first messaging

export interface CachedMessage {
  id: string
  text: string
  ciphertext: string
  iv: string
  sentAt: Date
  deviceId: string
  synced: boolean
}

const MESSAGES_KEY = "chat_messages"
const LAST_SYNC_KEY = "last_sync"
const ENCRYPTION_SALT_KEY = "encryption_salt"
const MASTER_KEY_KEY = "master_key"

export function saveMessages(messages: CachedMessage[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

export function getMessages(): CachedMessage[] {
  try {
    const data = localStorage.getItem(MESSAGES_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addMessage(message: CachedMessage) {
  const messages = getMessages()
  const exists = messages.some((m) => m.id === message.id)
  if (exists) return
  messages.push(message)
  saveMessages(messages)
}

export function getUnsynedMessages(): CachedMessage[] {
  return getMessages().filter((m) => !m.synced)
}

export function markMessageAsSynced(id: string) {
  const messages = getMessages()
  const msg = messages.find((m) => m.id === id)
  if (msg) {
    msg.synced = true
    saveMessages(messages)
  }
}

export function setLastSync(timestamp: Date) {
  localStorage.setItem(LAST_SYNC_KEY, timestamp.toISOString())
}

export function getLastSync(): Date {
  const data = localStorage.getItem(LAST_SYNC_KEY)
  return data ? new Date(data) : new Date(Date.now() - 24 * 60 * 60 * 1000) // Default: 24h ago
}

export function saveMasterKey(key: ArrayBuffer) {
  const keyStr = Array.from(new Uint8Array(key))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  localStorage.setItem(MASTER_KEY_KEY, keyStr)
}

export function getMasterKey(): ArrayBuffer | null {
  const keyStr = localStorage.getItem(MASTER_KEY_KEY)
  if (!keyStr) return null

  const bytes = keyStr.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) || []
  return new Uint8Array(bytes).buffer
}

export function clearMasterKey() {
  localStorage.removeItem(MASTER_KEY_KEY)
}
