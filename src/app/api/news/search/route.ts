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
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const scale = searchParams.get('scale') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10);

  if (!q && !category) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const db = await getPrisma();

    // Split query into words to improve matching for long claims
    const words = q.split(/\s+/).filter(w => w.length > 2);
    const searchConditions = words.map(word => ({
      OR: [
        { title: { contains: word } },
        { description: { contains: word } },
        { keywords: { contains: word } },
      ]
    }));

    const where: any = searchConditions.length > 0 ? { AND: searchConditions } : {};

    if (category && category !== 'All') where.category = category;
    if (scale && scale !== 'all') where.scale = scale;

    const articles = await db.newsArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
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
    });

    return NextResponse.json({ articles });
  } catch (err: any) {
    console.error('News search error:', err);
    return NextResponse.json({ articles: [] });
  }
}
