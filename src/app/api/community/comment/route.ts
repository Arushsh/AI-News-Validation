import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { reportId, content } = await req.json();
    
    const comment = await prisma.comment.create({
      data: {
        userId: (session.user as any).id,
        reportId,
        content
      }
    });

    return NextResponse.json(comment);
  } catch (e: any) {
    return NextResponse.json({ error: 'Comment failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get('reportId');
  if (!reportId) return NextResponse.json({ error: 'Missing reportId' }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { reportId },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(comments);
}
