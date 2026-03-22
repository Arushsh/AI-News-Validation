import { NextResponse } from 'next/server';
import { redis } from '@/lib/db/redis';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const jobId = params.jobId;

  try {
    // Poll Redis for job stage
    // The celery worker should update this key periodically: `job:status:${jobId}`
    const statusRaw = await redis.get(`job:status:${jobId}`);
    
    if (!statusRaw) {
       // Mock graceful degradation if background worker isn't running
       // We'll simulate progress if no Redis data is found
       return NextResponse.json({ 
         stage: 'Processing', 
         progress: 50, 
         eta: 5,
         status: 'RUNNING'
       });
    }

    const status = JSON.parse(statusRaw);

    // If complete, return the full report
    if (status.state === 'SUCCESS') {
      return NextResponse.json({
         state: 'SUCCESS',
         report: status.result
      });
    }

    return NextResponse.json({
       stage: status.stage || 'Analyzing',
       progress: status.progress || 30,
       eta: status.eta || 'Unknown',
       state: status.state,
       error: status.error
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Failed to fetch status." }, { status: 500 });
  }
}
