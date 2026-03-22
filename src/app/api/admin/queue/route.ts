import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    return false;
  }
  return true;
}

export async function GET() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const queue = await prisma.verificationReport.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    include: { submitter: { select: { name: true, email: true } } }
  });

  return NextResponse.json(queue);
}

export async function PATCH(req: Request) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { reportId, status } = await req.json(); // status: 'approved' | 'rejected'
  
  const report = await prisma.verificationReport.update({
    where: { id: reportId },
    data: { status }
  });

  // Optionally send notification to submitter here
  if (report.submitterId) {
    await prisma.notification.create({
      data: {
        userId: report.submitterId,
        title: `Report ${status}`,
        body: `Your submission "${report.title || 'Unknown'}" has been ${status}.`
      }
    });
  }

  return NextResponse.json(report);
}
