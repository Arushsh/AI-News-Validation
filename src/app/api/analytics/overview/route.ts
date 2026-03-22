import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DB connection failed");

    const [totalVerified, reports, totalNews, totalUsers] = await Promise.all([
      prisma.verificationReport.count(),
      prisma.verificationReport.findMany({ select: { authenticityScore: true } }),
      prisma.newsArticle.count(),
      prisma.user.count()
    ]);

    const fakeCaught = reports.filter(r => r.authenticityScore < 40).length;
    const avgAuthenticity = reports.length > 0 
      ? reports.reduce((acc, r) => acc + r.authenticityScore, 0) / reports.length 
      : 0;

    return NextResponse.json({
      totalVerified,
      fakeCaught,
      avgAuthenticity: parseFloat(avgAuthenticity.toFixed(1)),
      totalNews,
      totalUsers,
      isDemo: false
    });
  } catch (e: any) {
    console.error("Overview Analytics Error:", e);
    return NextResponse.json({ error: 'Analytics overview failed' }, { status: 500 });
  }
}
