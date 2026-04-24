import { redis } from './redis';

export async function getCachedFactCheck(query: string) {
  const cached = await redis.get(query);
  if (!cached) return null;
  return JSON.parse(cached);
}

export async function setCachedFactCheck(query: string, result: any, ttlSeconds: number = 86400) {
  // 24 hours ttl by default
  await redis.set(query, JSON.stringify(result), { ex: ttlSeconds });
}

export async function getCacheData(key: string) {
  const cached = await redis.get(key);
  if (!cached) return null;
  // Handle both string and object returns from Upstash
  return typeof cached === 'string' ? JSON.parse(cached) : cached;
}

export async function setCacheData(key: string, result: any, ttlSeconds: number = 900) {
  await redis.set(key, JSON.stringify(result), { ex: ttlSeconds });
}
