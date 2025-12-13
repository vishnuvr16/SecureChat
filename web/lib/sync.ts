import { refreshAccessToken } from "./auth";
import { encryptMessage, decryptMessage } from "./crypto"
import { addMessage, setLastSync, getLastSync, getUnsynedMessages, markMessageAsSynced, getMasterKey } from "./storage"
import type { Message, DecryptedMessage } from "./types"

export async function syncMessages(
  accessToken: string,
  user: { id: string; email: string; encryptionSalt: string },
  masterKey?: ArrayBuffer,
): Promise<DecryptedMessage[]> {
  try {
    const key = masterKey || getMasterKey()

    if (!key) {
      throw new Error("No master key available. Please login again.")
    }

    // Get last sync time
    const lastSync = getLastSync()

    // Fetch new messages from server
    const response = await fetch(`/api/messages/since?timestamp=${lastSync.toISOString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "x-device-id": "web",
      },
    })
    console.log("Sync response status:", response);
    if (response.status === 401) {
      console.log("refreshing token...");
      const newAccessToken = await refreshAccessToken()
      if (!newAccessToken) throw new Error("Unauthorized")
      
    }

    if (!response.ok) {
      throw new Error("Failed to sync messages")
    }

    const data = (await response.json()) as { messages: Message[] }
    console.log("Fetched messages:", data.messages)
    // Decrypt and store messages
    const decryptedMessages: DecryptedMessage[] = []

    for (const msg of data.messages) {
      try {
        console.log("Decrypting message id:", msg.id);
        const text = await decryptMessage(key, msg.ciphertext, msg.iv)
        console.log("Decrypted text:", text);
        const decrypted: DecryptedMessage = {
          id: msg.id,
          text,
          sentAt: new Date(msg.sentAt),
          deviceId: msg.deviceId,
        }

        console.log("Decrypted message:", decrypted)

        // Store in local cache
        addMessage({
          id: msg.id,
          text,
          ciphertext: msg.ciphertext,
          iv: msg.iv,
          sentAt: new Date(msg.sentAt),
          deviceId: msg.deviceId,
          synced: true,
        })

        decryptedMessages.push(decrypted)
      } catch (err) {
        console.error("Failed to decrypt message:", err)
      }
    }

    // Sync unsynced local messages
    const unsynced = getUnsynedMessages()
    for (const msg of unsynced) {
      try {
        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
            "x-device-id": "web",
          },
          body: JSON.stringify({
            ciphertext: msg.ciphertext,
            iv: msg.iv,
            sentAt: msg.sentAt.toISOString(),
          }),
        })

        console.log("Syncing local message response status:", response);

        if (response.ok) {
          markMessageAsSynced(msg.id)
        }
      } catch (err) {
        console.error("Failed to sync message:", err)
      }
    }

    setLastSync(new Date())
    return decryptedMessages
  } catch (error) {
    console.error("Sync error:", error)
    throw error
  }
}

export async function sendMessage(
  text: string,
  accessToken: string,
  masterKey: ArrayBuffer,
): Promise<{ id: string; sentAt: Date; ciphertext: string; iv: string }> {
  const { ciphertext, iv } = await encryptMessage(masterKey, text)
  const sentAt = new Date()

  try {
    const response = await fetch("/api/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
        "x-device-id": "web",
      },
      body: JSON.stringify({
        ciphertext,
        iv,
        sentAt: sentAt.toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send message")
    }

    const data = (await response.json()) as { id: string; sentAt: string }

    return {
      id: data.id,
      sentAt: new Date(data.sentAt),
      ciphertext,
      iv,
    }
  } catch (error) {
    // Offline: store locally for later sync
    const localId = `local_${Date.now()}`
    addMessage({
      id: localId,
      text,
      ciphertext,
      iv,
      sentAt,
      deviceId: "web",
      synced: false,
    })

    return {
      id: localId,
      sentAt,
      ciphertext,
      iv,
    }
  }
}
