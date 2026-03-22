import { NextResponse } from 'next/server';

let prisma: any = null;
async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const scale = searchParams.get('scale') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const skip = parseInt(searchParams.get('skip') || '0');

  try {
    const db = await getPrisma();

    const where: any = {};
    if (category && category !== 'All') where.category = category;
    if (scale && scale !== 'all') where.scale = scale;

    const [articles, total] = await Promise.all([
      db.newsArticle.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          sourceUrl: true,
          sourceName: true,
          category: true,
          scale: true,
          publishedAt: true,
        },
      }),
      db.newsArticle.count({ where }),
    ]);

    // Return articles or fallback if DB is empty
    if (articles.length === 0) {
      return NextResponse.json({ articles: getMockArticles(category, scale), total: 0, fromCache: true });
    }

    return NextResponse.json({ articles, total, fromCache: false });
  } catch (err: any) {
    console.error('News list error:', err);
    return NextResponse.json({ articles: getMockArticles(category, scale), total: 0, fromCache: true });
  }
}

function getMockArticles(category: string, scale: string) {
  return [
    {
      id: '1', title: 'India Budget 2026: Key highlights and what it means for you', description: 'Finance Minister presented the Union Budget with major focus on infrastructure and tax relief for middle class.', imageUrl: null, sourceUrl: 'https://hindustantimes.com/budget-2026', sourceName: 'Hindustan Times', category: 'Politics', scale: 'national', publishedAt: new Date().toISOString(),
    },
    {
      id: '2', title: 'AI revolution sweeps global tech industry in 2026', description: 'Major tech companies announce breakthroughs in artificial general intelligence research this quarter.', imageUrl: null, sourceUrl: 'https://timesofindia.com/ai-2026', sourceName: 'Times of India', category: 'Technology', scale: 'international', publishedAt: new Date().toISOString(),
    },
    {
      id: '3', title: 'India vs Australia: T20 World Cup Semi-Final Preview', description: 'Indian cricket team prepares for the crucial semi-final match against Australia at the hybrid venues.', imageUrl: null, sourceUrl: 'https://hindustantimes.com/sports/t20-semi', sourceName: 'Hindustan Times', category: 'Sports', scale: 'national', publishedAt: new Date().toISOString(),
    },
    {
      id: '4', title: 'Global Markets: Dow Jones hits new all-time high', description: 'Wall Street surged on positive US jobs data and cooling inflation figures released this morning.', imageUrl: null, sourceUrl: 'https://timesofindia.com/markets-high', sourceName: 'Times of India', category: 'Business', scale: 'international', publishedAt: new Date().toISOString(),
    },
    {
      id: '5', title: 'WHO warns of new respiratory virus spreading in South Asia', description: 'The World Health Organization is monitoring a new variant detected in several South Asian countries.', imageUrl: null, sourceUrl: 'https://hindustantimes.com/health-who', sourceName: 'Hindustan Times', category: 'Health', scale: 'international', publishedAt: new Date().toISOString(),
    },
    {
      id: '6', title: 'Bollywood mega release breaks opening weekend records', description: 'The star-studded production set a new record for biggest opening weekend in Indian cinema history.', imageUrl: null, sourceUrl: 'https://timesofindia.com/bollywood-record', sourceName: 'Times of India', category: 'Entertainment', scale: 'national', publishedAt: new Date().toISOString(),
    },
  ].filter(a =>
    (!category || category === 'All' || a.category === category) &&
    (!scale || scale === 'all' || a.scale === scale)
  );
}
