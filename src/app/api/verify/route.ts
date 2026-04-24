import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/db/redis';
import { GoogleFactCheckService } from '@/services/fact-checking/google-fact.service';
import { GroqService } from '@/services/ai/groq.service';
import { TavilySearchService } from '@/services/search/tavily.service';
import { HuggingFaceService } from '@/services/ai/huggingface.service';
import { ArticleScraperService } from '@/services/scraper/article-scraper.service';
import { AudioDeepfakeService } from '@/services/ai/audio.service';
import { VideoDeepfakeService } from '@/services/ai/video.service';
import { getPrisma } from '@/lib/db/prisma';

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let claim = '';
    let url = '';
    let image = null;
    let fileMeta: any = null;
    let fileBuffer: Buffer | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      claim = formData.get('claim') as string || '';
      url = formData.get('url') as string || '';

      if (file) {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: 'File too large.' }, { status: 400 });
        }
        fileMeta = { name: file.name, type: file.type, size: file.size };
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);

        if (file.type.startsWith('image/')) {
          image = `data:${file.type};base64,${fileBuffer.toString('base64')}`;
        }
      }
    } else {
      const body = await request.json();
      claim = body.claim || '';
      url = body.url || '';
      image = body.image || null;
    }

    if (!claim && !url && !image && !fileMeta) {
      return NextResponse.json({ error: "A claim, URL, or image is required." }, { status: 400 });
    }

    const jobId = uuidv4();
    
    (async () => {
       try {
         await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 10, stage: 'Uploading' }), { ex: 3600 });

         // ── IMAGE ──────────────────────────────────────────────────────
         if (image || (fileMeta && fileMeta.type.startsWith('image/'))) {
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 40, stage: 'Running AI analysis...' }), { ex: 3600 });
           const hfEngine = new HuggingFaceService();
           const finalAnalysis = await hfEngine.analyzeDeepfake(image!);
           const prisma = getPrisma();
           if (prisma) {
             await prisma.verificationReport.create({ data: { content: 'Image Deepfake Analysis', authenticityScore: finalAnalysis.authenticity_score, aiGeneratedProb: finalAnalysis.ai_generated_probability, explanation: finalAnalysis.explanation, category: 'Technology', status: 'approved' } });
           }
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'SUCCESS', result: finalAnalysis }), { ex: 3600 });
           return;
         }

         // ── VIDEO ──────────────────────────────────────────────────────
         if (fileMeta && fileMeta.type.startsWith('video/') && fileBuffer) {
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 30, stage: 'Searching trusted sources...' }), { ex: 3600 });
           await new Promise(r => setTimeout(r, 700));
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 65, stage: 'Running AI analysis...' }), { ex: 3600 });
           const videoEngine = new VideoDeepfakeService();
           const finalAnalysis = await videoEngine.analyzeDeepfake(fileBuffer, fileMeta.name);
           const prisma = getPrisma();
           if (prisma) {
             await prisma.verificationReport.create({ data: { content: `Video Deepfake Analysis: ${fileMeta.name}`, authenticityScore: finalAnalysis.authenticity_score, aiGeneratedProb: finalAnalysis.ai_generated_probability, explanation: finalAnalysis.explanation, category: 'Technology', status: 'approved' } });
           }
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'SUCCESS', result: finalAnalysis }), { ex: 3600 });
           return;
         }

         // ── AUDIO ──────────────────────────────────────────────────────
         if (fileMeta && fileMeta.type.startsWith('audio/') && fileBuffer) {
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 30, stage: 'Searching trusted sources...' }), { ex: 3600 });
           await new Promise(r => setTimeout(r, 500));
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 65, stage: 'Running AI analysis...' }), { ex: 3600 });
           const audioEngine = new AudioDeepfakeService();
           const finalAnalysis = await audioEngine.analyzeDeepfake(fileBuffer);
           const prisma = getPrisma();
           if (prisma) {
             await prisma.verificationReport.create({ data: { content: `Audio Deepfake Analysis: ${fileMeta.name}`, authenticityScore: finalAnalysis.authenticity_score, aiGeneratedProb: finalAnalysis.ai_generated_probability, explanation: finalAnalysis.explanation, category: 'Technology', status: 'approved' } });
           }
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'SUCCESS', result: finalAnalysis }), { ex: 3600 });
           return;
         }

         // ── TEXT / URL ─────────────────────────────────────────────────
         let claimToVerify = claim;

         if (url) {
           await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 30, stage: 'Fetching related news...' }), { ex: 3600 });
           const scraper = new ArticleScraperService();
           const articleText = await scraper.scrapeArticle(url);
           claimToVerify = `The following is an article from ${url}:\n\n${articleText}`;
         }

         await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 50, stage: 'Comparing multiple sources...' }), { ex: 3600 });
         const factChecker = new GoogleFactCheckService();
         const aiEngine = new GroqService();
         const searchEngine = new TavilySearchService();
         
         const [factCheckData, searchContext] = await Promise.all([
           factChecker.verifyClaim(claimToVerify),
           searchEngine.searchContext(url || claim)
         ]);

         await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 80, stage: 'Scanning news database...' }), { ex: 3600 });

         let supporting_articles: any[] = [];
         const prisma = getPrisma();
         try {
           if (!prisma) throw new Error("DB connection failed");

           const searchTopic = (claim || url || claimToVerify).slice(0, 80);
           const words = searchTopic.split(/\s+/)
             .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
             .filter(w => w.length > 3 && !['what', 'when', 'this', 'that', 'with', 'from', 'where', 'will', 'does', 'even', 'been', 'many'].includes(w.toLowerCase()));
           
           if (words.length > 0) {
             const matchedArticles = await prisma.newsArticle.findMany({
               where: {
                 OR: words.slice(0, 6).map(word => ({
                   OR: [
                     { title: { contains: word } },
                     { description: { contains: word } }
                   ]
                 }))
               },
               orderBy: { publishedAt: 'desc' },
               take: 15
             });

             supporting_articles = matchedArticles.filter((art: any) => {
               const artText = (art.title + art.description).toLowerCase();
               const matches = words.filter(w => artText.includes(w.toLowerCase()));
               return matches.length >= 2 || matches.some(m => m.length > 7);
             }).slice(0, 3);
           }

           if (supporting_articles.length < 1 && words.length > 0) {
             const { DiscoveryService } = await import('@/services/news/discovery.service');
             const targetedQuery = words.slice(0, 4).join(' '); 
             const fresh = await DiscoveryService.fetchTargeted(targetedQuery);
             if (fresh && fresh.length > 0) {
               supporting_articles = fresh.slice(0, 3);
             }
           }
         } catch (err) {
           console.error("Supporting evidence retrieval error:", err);
         }
         
         await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'RUNNING', progress: 95, stage: 'Synthesizing final verdict...' }), { ex: 3600 });
         
         const finalAnalysis = await aiEngine.synthesizeResults(claimToVerify, factCheckData, searchContext, supporting_articles);
         
         const safeSupporting = supporting_articles.filter(art => {
            if (!finalAnalysis.category) return true;
            if (finalAnalysis.category === 'General') return true;
            const artCat = art.category || 'General';
            return artCat === 'General' || artCat === finalAnalysis.category;
         });

         // Analytics: Persist verification report to Prisma
         if (prisma) {
           await prisma.verificationReport.create({
             data: {
               title: claim.slice(0, 80),
               content: claimToVerify.slice(0, 500),
               url: url || null,
               authenticityScore: finalAnalysis.authenticity_score,
               aiGeneratedProb: finalAnalysis.ai_generated_probability,
               explanation: finalAnalysis.explanation,
               category: finalAnalysis.category || 'General',
               status: 'approved'
             }
           });
         }

         await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'SUCCESS', result: { ...finalAnalysis, supporting_articles: safeSupporting } }), { ex: 3600 });

       } catch (err: any) {
         await redis.set(`job:status:${jobId}`, JSON.stringify({ state: 'FAILURE', error: err.message }), { ex: 3600 });
       }
    })().catch(console.error);

    return NextResponse.json({ jobId });

  } catch (error: any) {
    console.error("Verification Route Error:", error);
    return NextResponse.json({ error: "Verification initialization failed." }, { status: 500 });
  }
}
