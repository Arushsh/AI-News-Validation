import { NextResponse } from 'next/server';
import { getCacheData, setCacheData } from '@/lib/db/cache';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const action = params.action;
  
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'news';
  const sig = searchParams.get('sig') || '0';
  const w = searchParams.get('w') || '400';
  const h = searchParams.get('h') || '300';
  
  const cacheKey = `img:${action}:${q}:${sig}`;
  const cachedUrl = await getCacheData(cacheKey);
  if (cachedUrl) {
    return NextResponse.redirect(cachedUrl);
  }

  // Fallback direct unsplash source URL if API is unavailable or missing
  const imageUrl = `https://source.unsplash.com/random/${w}x${h}?sig=${sig}&${q}`;
  
  await setCacheData(cacheKey, imageUrl, 3600); // 1hr TTL

  return NextResponse.redirect(imageUrl);
}
