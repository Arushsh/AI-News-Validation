import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DB connection failed");

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const reports = await prisma.verificationReport.findMany({
      where: { createdAt: { gte: oneYearAgo } },
      select: { createdAt: true }
    });

    return NextResponse.json(reports);
  } catch (e: any) {
    console.error("Heatmap Analytics Error:", e);
    return NextResponse.json({ error: 'Analytics heatmap failed' }, { status: 500 });
  }
}
