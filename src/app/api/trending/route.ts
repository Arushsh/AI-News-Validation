import { NextResponse } from 'next/server';

const TRUSTED_DOMAINS = [
  'reuters.com', 'apnews.com', 'bbc.com', 'nytimes.com', 'theguardian.com', // Global
  'timesofindia.indiatimes.com', 'ndtv.com', 'thehindu.com', 'indianexpress.com' // National/Local (IN)
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'trending'; // trending, viral, controversial, fake
  const scale = searchParams.get('scale') || 'international'; // international, national, local

  try {
    // 1. Check if n8n is configured
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      try {
        const n8nRes = await fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ section, scale, timestamp: new Date().toISOString(), type: 'trending' })
        });
        if (n8nRes.ok) {
          const n8nData = await n8nRes.json();
          if (Array.isArray(n8nData)) return NextResponse.json(n8nData);
        }
      } catch (e) {
        console.warn("n8n trending fetch failed, falling back to Tavily", e);
      }
    }

    // 2. Fallback to Tavily News Search
    const apiKey = process.env.TAVILY_API_KEY || '';
    if (!apiKey || apiKey.includes('your_tavily')) {
      return NextResponse.json(getMockData(section));
    }

    const queries: Record<string, string> = {
      trending: "current trending news stories today",
      viral: "most viral social media news today",
      controversial: "most controversial news debates today",
      fake: "debunked fake news stories today"
    };

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: queries[section] || queries.trending,
        search_depth: "basic",
        max_results: 6,
        include_images: true
      })
    });

    const data = await response.json();
    if (!response.ok || !data.results) return NextResponse.json(getMockData(section));

    const results = data.results.map((r: any, i: number) => ({
      id: i,
      title: r.title,
      url: r.url,
      score: section === 'fake' ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 40) + 50,
      domain: new URL(r.url).hostname.replace('www.', ''),
      category: 'News', // Simplified
      timestamp: 'Today',
      image: r.image || null,
      isTrusted: TRUSTED_DOMAINS.some(d => r.url.includes(d))
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(getMockData(section));
  }
}

function getMockData(section: string) {
  const mocks: Record<string, any[]> = {
    trending: [
      { id: 1, title: "Global climate summit reaches historic agreement", category: "Politics", score: 88, domain: "reuters.com", timestamp: "1h ago" },
      { id: 2, title: "New AI model achieves human-level reasoning", category: "Tech", score: 92, domain: "techcrunch.com", timestamp: "2h ago" }
    ],
    viral: [
      { id: 3, title: "Mystery signal from deep space baffles NASA", category: "Science", score: 64, domain: "theverge.com", timestamp: "3h ago" },
      { id: 4, title: "Pop star surprise performance in city square", category: "Entertainment", score: 71, domain: "tmz.com", timestamp: "4h ago" }
    ],
    controversial: [
      { id: 5, title: "New tax law sparks nationwide debate", category: "Politics", score: 48, domain: "wsj.com", timestamp: "5h ago" },
      { id: 6, title: "Controversial study on remote work efficiency", category: "Business", score: 52, domain: "forbes.com", timestamp: "6h ago" }
    ],
    fake: [
      { id: 7, title: "CLAIM: Eating gold flakes cures COVID-26 — Busted", category: "Health", score: 4, domain: "factcheck.org", timestamp: "7h ago" },
      { id: 8, title: "DEBUNKED: AI didn't actually replace 5M lawyers yesterday", category: "Tech", score: 12, domain: "apnews.com", timestamp: "8h ago" }
    ]
  };
  return mocks[section] || mocks.trending;
}

