import { redis } from './redis';

export async function getCachedFactCheck(query: string) {
  const cached = await redis.get(query);
  if (!cached) return null;
  return JSON.parse(cached);
}

export async function setCachedFactCheck(query: string, result: any, ttlSeconds: number = 86400) {
  // 24 hours ttl by default
  await redis.setex(query, ttlSeconds, JSON.stringify(result));
}

export async function getCacheData(key: string) {
  const cached = await redis.get(key);
  if (!cached) return null;
  return JSON.parse(cached);
}

export async function setCacheData(key: string, result: any, ttlSeconds: number = 900) {
  await redis.setex(key, ttlSeconds, JSON.stringify(result));
}
