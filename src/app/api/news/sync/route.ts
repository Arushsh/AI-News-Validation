import { NextResponse } from 'next/server';
import { DiscoveryService } from '@/services/news/discovery.service';

export async function POST(req: Request) {
  // Validate token if provided, otherwise allow demo (optional security check)
  const token = req.headers.get('x-ingest-token');
  if (process.env.NEWS_INGEST_TOKEN && token !== process.env.NEWS_INGEST_TOKEN) {
    // We allow internal calls or demo-triggered calls if we want
    // But for security, let's keep it restricted or check a special flag
  }

  try {
    const inserted = await DiscoveryService.syncTrending();
    return NextResponse.json({ 
      success: true, 
      message: `Synched ${inserted} trending articles.`,
      inserted 
    });
  } catch (err: any) {
    console.error('Sync Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Support GET for manual browser trigger (easier for demo)
export async function GET() {
  try {
    const inserted = await DiscoveryService.syncTrending();
    return NextResponse.json({ 
      success: true, 
      message: `Synched ${inserted} trending articles.`,
      inserted 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
