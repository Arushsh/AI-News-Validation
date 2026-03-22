import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { reportId, stance } = await req.json(); // stance: 'yes' | 'no'
    
    // Upsert vote
    const vote = await prisma.vote.upsert({
      where: { userId_reportId: { userId: (session.user as any).id, reportId } },
      update: { stance },
      create: { userId: (session.user as any).id, reportId, stance }
    });

    return NextResponse.json(vote);
  } catch (e: any) {
    return NextResponse.json({ error: 'Vote failed' }, { status: 500 });
  }
}
