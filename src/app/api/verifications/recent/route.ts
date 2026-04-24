import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DB connection failed");

    const reports = await prisma.verificationReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        category: true,
        authenticityScore: true,
        createdAt: true,
        url: true,
      }
    });

    const results = reports.map(r => ({
      id: r.id,
      title: r.title || 'Untitled Verification',
      category: r.category || 'General',
      score: r.authenticityScore,
      timestamp: formatTime(new Date(r.createdAt)),
      domain: r.url ? new URL(r.url).hostname.replace('www.', '') : 'veridex.ai',
      imageColor: generateGradient(r.category || 'General')
    }));

    return NextResponse.json(results);
  } catch (e: any) {
    console.error("Recent Verifications API Error:", e);
    return NextResponse.json({ error: 'Failed to fetch recent verifications' }, { status: 500 });
  }
}

function formatTime(date: Date) {
  const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000 / 60);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
  return `${Math.floor(diff/1440)}d ago`;
}

function generateGradient(category: string) {
  const map: Record<string, string> = {
    Politics: 'linear-gradient(135deg,#1e293b,#0f172a)',
    Tech: 'linear-gradient(135deg,#162032,#0c1a2e)',
    Technology: 'linear-gradient(135deg,#162032,#0c1a2e)',
    Sports: 'linear-gradient(135deg,#1a1200,#0a0800)',
    Business: 'linear-gradient(135deg,#064e3b,#022c22)',
    General: 'linear-gradient(135deg,#2d3748,#1a202c)'
  };
  return map[category] || map.General;
}
