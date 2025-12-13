import { getAccessToken, saveAccessToken } from "./storage"

let tokenRefreshInterval: ReturnType<typeof setTimeout> | null = null

export function startTokenRefreshTimer(): void {
  // Refresh token every 15 minutes
  tokenRefreshInterval = setInterval(
    async () => {
      try {
        const accessToken = await getAccessToken()
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.ok) {
          const data = (await response.json()) as { accessToken: string }
          await saveAccessToken(data.accessToken)
        }
      } catch (err) {
        console.error("Token refresh failed:", err)
      }
    },
    15 * 60 * 1000,
  ) // 15 minutes
}

export function stopTokenRefreshTimer(): void {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
    tokenRefreshInterval = null
  }
}
