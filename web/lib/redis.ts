import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function setRedisKey(key: string, value: string, ttl: number) {
  await redis.set(key, value, { ex: ttl })
}

export async function getRedisKey(key: string) {
  return redis.get<string>(key)
}

export async function deleteRedisKey(key: string) {
  await redis.del(key)
}

export async function setQRToken(token: string, userId: string) {
  await setRedisKey(`qr_login:${token}`, JSON.stringify({ userId, createdAt: new Date() }), 60)
}

export async function getQRToken(token: string) {
  const data = await getRedisKey(`qr_login:${token}`)
  console.log("QR token data retrieved from Redis:", data)

  if (!data) return null;

  // If Redis returned an object, return as-is
  if (typeof data === "object") return data;

  // If Redis returned a JSON string, parse it
  return JSON.parse(data);
}

export async function deleteQRToken(token: string) {
  await deleteRedisKey(`qr_login:${token}`)
}
