import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DB connection failed");

    const reports = await prisma.verificationReport.findMany({
      select: { category: true, authenticityScore: true },
      take: 1000 // Limit for safety
    });

    const categories = ['Politics', 'Technology', 'Health', 'Business', 'Sports', 'World', 'General'];
    const breakdown = categories.map(cat => ({
      label: cat,
      value: reports.filter(r => r.category === cat).length
    })).filter(c => c.value > 0);

    // If no reports, allow some fallback categories for UI clarity
    if (breakdown.length === 0) {
      breakdown.push({ label: 'No Data', value: 0 });
    }

    // Dummy trends for visualization (we can improve later to use dates)
    const trends = [30, 45, 35, 60, 55, 75, 70, 90, 85, 100, 95, 110];

    return NextResponse.json({
      trends,
      breakdown,
      isDemo: false
    });
  } catch (e: any) {
    console.error("Detailed Analytics Error:", e);
    return NextResponse.json({ error: 'Detailed analytics failed' }, { status: 500 });
  }
}
