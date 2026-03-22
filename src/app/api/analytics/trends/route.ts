import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DB connection failed");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const reports = await prisma.verificationReport.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true }
    });

    return NextResponse.json(reports);
  } catch (e: any) {
    console.error("Trends Analytics Error:", e);
    return NextResponse.json({ error: 'Analytics trends failed' }, { status: 500 });
  }
}
