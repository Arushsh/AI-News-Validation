import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DB connection failed");

    // Group reports by URL/domain and count those with low scores
    const reports = await prisma.verificationReport.findMany({
      where: { authenticityScore: { lt: 40 } },
      select: { url: true }
    });

    const counts: Record<string, number> = {};
    reports.forEach(r => {
      if (!r.url) return;
      try {
        const domain = new URL(r.url).hostname;
        counts[domain] = (counts[domain] || 0) + 1;
      } catch {
        counts[r.url] = (counts[r.url] || 0) + 1;
      }
    });

    const sources = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Fallback if no fake news caught yet
    if (sources.length === 0) {
      return NextResponse.json([
        { name: 'No threats detected', count: 0 }
      ]);
    }

    return NextResponse.json(sources);
  } catch (e: any) {
    console.error("Sources Analytics Error:", e);
    return NextResponse.json({ error: 'Sources analytics failed' }, { status: 500 });
  }
}
