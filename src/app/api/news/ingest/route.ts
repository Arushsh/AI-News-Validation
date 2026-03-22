import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Lazy Prisma init to avoid cold-start crashes
let prisma: any = null;
async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

const VALID_CATEGORIES = ['Politics', 'Sports', 'Technology', 'Business', 'Entertainment', 'Health', 'World', 'Science', 'General'];
const VALID_SCALES = ['international', 'national', 'local'];

function normalizeCategory(cat: string): string {
  if (!cat) return 'General';
  const found = VALID_CATEGORIES.find(c => c.toLowerCase() === cat.toLowerCase());
  return found || 'General';
}

function normalizeScale(scale: string, sourceName: string): string {
  if (scale && VALID_SCALES.includes(scale.toLowerCase())) return scale.toLowerCase();
  // Auto-detect national from known Indian sources
  const nationalSources = ['Hindustan Times', 'Times of India', 'NDTV', 'The Hindu', 'Indian Express', 'India Today', 'Hindustan'];
  const internationalSources = ['Global Times', 'Reuters', 'BBC', 'AP News', 'Al Jazeera', 'CNN', 'The Guardian', 'The New York Times', 'ESPN', 'Cricbuzz', 'TechCrunch', 'The Verge', 'Wired', 'UN News', 'Global News'];
  
  if (nationalSources.some(s => sourceName?.includes(s))) return 'national';
  if (internationalSources.some(s => sourceName?.includes(s))) return 'international';
  
  return 'international';
}

function autoCategorize(sourceName: string, currentCat: string, title: string = ''): string {
  if (currentCat && currentCat !== 'General') return currentCat;
  
  const sportsSources = ['ESPN', 'Cricbuzz', 'Sports'];
  const techSources = ['TechCrunch', 'The Verge', 'Wired', 'Tech', 'Digital'];
  const worldKeywords = ['War', 'Conflict', 'Crisis', 'Israel', 'Gaza', 'Ukraine', 'Global', 'International'];
  
  if (sportsSources.some(s => sourceName?.includes(s))) return 'Sports';
  if (techSources.some(s => sourceName?.includes(s))) return 'Technology';
  if (worldKeywords.some(k => title?.includes(k))) return 'World';
  
  return currentCat || 'General';
}

export async function GET() {
  return NextResponse.json({
    status: 'VerifyLens News Ingest API',
    description: 'This endpoint accepts POST requests from N8N to ingest news articles.',
    method: 'POST',
    requiredHeader: 'X-Ingest-Token: YOUR_TOKEN',
    token: process.env.NEWS_INGEST_TOKEN ? '✅ Token configured' : '❌ NEWS_INGEST_TOKEN not set',
    bodyFormat: {
      articles: [
        {
          title: 'Article title',
          description: 'Short summary',
          content: 'Full text (optional)',
          imageUrl: 'https://...',
          sourceUrl: 'https://hindustantimes.com/...',
          sourceName: 'Hindustan Times',
          category: 'Politics | Sports | Technology | Business | Entertainment | Health | World | Science',
          scale: 'international | national | local',
          publishedAt: '2026-03-22T00:00:00Z',
          keywords: 'comma,separated,keywords'
        }
      ]
    }
  });
}

export async function POST(req: Request) {
  // Validate the ingest token
  const token = req.headers.get('x-ingest-token');
  if (token !== process.env.NEWS_INGEST_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const articles = Array.isArray(body) ? body : body.articles;

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'No articles provided' }, { status: 400 });
    }

    const db = await getPrisma();
    let inserted = 0;
    let skipped = 0;

    for (const art of articles) {
      if (!art.title || !art.sourceUrl) { skipped++; continue; }

      const dedupeHash = crypto.createHash('md5').update(art.sourceUrl).digest('hex');

      try {
        await db.newsArticle.upsert({
          where: { dedupeHash },
          update: {}, // don't update existing articles
          create: {
            title: art.title,
            description: art.description || null,
            content: art.content || null,
            imageUrl: art.imageUrl || null,
            sourceUrl: art.sourceUrl,
            sourceName: art.sourceName || 'Unknown Source',
            category: normalizeCategory(autoCategorize(art.sourceName || '', art.category, art.title || '')),
            scale: normalizeScale(art.scale, art.sourceName),
            publishedAt: art.publishedAt ? new Date(art.publishedAt) : new Date(),
            keywords: art.keywords || null,
            dedupeHash,
          },
        });

        // Update Source tracking table
        if (art.sourceName) {
           const domain = new URL(art.sourceUrl).hostname;
           await db.source.upsert({
             where: { domain },
             update: { articles: { increment: 1 } },
             create: {
               name: art.sourceName,
               domain,
               category: art.category || 'General',
               articles: 1,
               credibility: 50
             }
           }).catch(() => {});
        }
        inserted++;
      } catch {
        skipped++; // duplicate or constraint error
      }
    }

    return NextResponse.json({ success: true, inserted, skipped, total: articles.length });
  } catch (err: any) {
    console.error('Ingest error:', err);
    return NextResponse.json({ error: 'Internal error', details: err.message }, { status: 500 });
  }
}
