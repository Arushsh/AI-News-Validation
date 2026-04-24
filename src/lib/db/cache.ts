import { redis } from './redis';

export async function getCachedFactCheck(query: string) {
  const cached = await redis.get(query);
  if (!cached) return null;
  // Upstash REST client can return a string or a pre-parsed object
  if (typeof cached === 'string') {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return cached;
    }
  }
  return cached;
}

export async function setCachedFactCheck(query: string, result: any, ttlSeconds: number = 86400) {
  // Store as stringified JSON with expiration
  await redis.set(query, JSON.stringify(result), { ex: ttlSeconds });
}

export async function getCacheData(key: string) {
  const cached = await redis.get(key);
  if (!cached) return null;
  if (typeof cached === 'string') {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return cached;
    }
  }
  return cached;
}

export async function setCacheData(key: string, result: any, ttlSeconds: number = 900) {
  await redis.set(key, JSON.stringify(result), { ex: ttlSeconds });
}
