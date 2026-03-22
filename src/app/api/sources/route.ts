import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DB connection failed");

    // Fetch all sources and their article counts from the NewsArticle table
    const [sources, articleCounts] = await Promise.all([
      prisma.source.findMany({ orderBy: { credibility: 'desc' } }),
      prisma.newsArticle.groupBy({
        by: ['sourceName'],
        _count: { _all: true }
      })
    ]);

    // Map real article counts to sources
    const results = sources.map(s => {
      const realCount = articleCounts.find(c => c.sourceName === s.name)?._count._all || 0;
      return {
        ...s,
        articles: Math.max(s.articles, realCount) // Preserve seeded counts if higher
      };
    });

    return NextResponse.json(results);
  } catch (e: any) {
    console.error("Sources API Error:", e);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}
