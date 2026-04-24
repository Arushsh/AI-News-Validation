import { Redis } from '@upstash/redis';

// Use the REST client for better performance on serverless (Netlify/Vercel)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
