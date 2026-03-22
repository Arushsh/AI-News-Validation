import axios from 'axios';
import * as cheerio from 'cheerio';

export interface DiscoveryTopic {
  name: string;
  query: string;
  category: string;
}

const TOPICS: DiscoveryTopic[] = [
  { name: 'War & Conflict', query: 'West Asia War Israel Gaza Ukraine Russia Conflict', category: 'World' },
  { name: 'Global News', query: 'Global News Breaking World Headlines', category: 'World' },
  { name: 'UN News', query: 'UN News United Nations Peace Security', category: 'World' },
  { name: 'International Market', query: 'Global Stock Market Business Economy News', category: 'Business' },
  { name: 'Trending Technology', query: 'AI Technology Innovation 2026 Tech Trends', category: 'Technology' },
  { name: 'Top Sports', query: 'Live Sports Result Cricket Football World Cup', category: 'Sports' },
  { name: 'National Issues', query: 'India News National Issues Politics Headlines', category: 'Politics' },
];

export class DiscoveryService {
  private static INGEST_ENDPOINT = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/api/news/ingest` 
    : 'http://localhost:3000/api/news/ingest';

  static async syncTrending() {
    console.log('Starting Discovery Sync...');
    let totalInserted = 0;
    
    for (const topic of TOPICS) {
      try {
        const articles = await this.fetchFromGoogleNews(topic);
        if (articles.length > 0) {
          const res = await axios.post(this.INGEST_ENDPOINT, { articles }, {
            headers: { 'X-Ingest-Token': process.env.NEWS_INGEST_TOKEN }
          });
          totalInserted += res.data.inserted || 0;
          console.log(`Topic [${topic.name}]: Synced ${res.data.inserted} articles`);
        }
      } catch (err: any) {
        console.error(`Failed to sync topic [${topic.name}]:`, err.message);
      }
    }
    
    return totalInserted;
  }

  /**
   * Performs an on-demand search for a specific claim, targeting high-authority domains.
   */
  static async fetchTargeted(claim: string, category: string = 'General'): Promise<any[]> {
    console.log(`[Discovery] On-demand search for: ${claim} (${category})`);
    const domains = [
      'reuters.com', 
      'hindustantimes.com', 
      'timesofindia.indiatimes.com',
      'apnews.com',
      'aljazeera.com',
      'globalnews.ca'
    ];
    
    // Construct search string: (claim) site:bbc.com OR site:reuters.com ...
    const query = `${claim} site:${domains.join(' OR site:')}`;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    
    try {
      const { data: xml } = await axios.get(url);
      const $ = cheerio.load(xml, { xmlMode: true });
      const articles: any[] = [];
      
      $('item').each((i, el) => {
        if (i >= 5) return;
        const title = $(el).find('title').text();
        const link = $(el).find('link').text();
        const source = $(el).find('source').text();
        const pubDate = $(el).find('pubDate').text();
        
        articles.push({
          title,
          description: `Verified source report regarding "${claim}".`,
          sourceUrl: link,
          sourceName: source || 'Verified Source',
          category: 'General',
          scale: 'international',
          publishedAt: new Date(pubDate).toISOString(),
        });
      });
      
      if (articles.length > 0) {
        await axios.post(this.INGEST_ENDPOINT, { articles }, {
          headers: { 'X-Ingest-Token': process.env.NEWS_INGEST_TOKEN }
        });
      }
      return articles;
    } catch (err: any) {
      console.error('Targeted Discovery Error:', err.message);
      return [];
    }
  }

  private static async fetchFromGoogleNews(topic: DiscoveryTopic) {
    // Google News RSS feed search
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic.query)}&hl=en-IN&gl=IN&ceid=IN:en`;
    const { data: xml } = await axios.get(url);
    const $ = cheerio.load(xml, { xmlMode: true });
    
    const articles: any[] = [];
    
    $('item').each((i, el) => {
      if (i >= 6) return; // Fetch a few more for variety
      
      const title = $(el).find('title').text();
      const link = $(el).find('link').text();
      const pubDate = $(el).find('pubDate').text();
      const source = $(el).find('source').text();
      const description = $(el).find('description').text();
      
      // Try to find an image in the description (Google News often hides it there)
      let imageUrl = null;
      if (description) {
        const imgMatch = description.match(/src="([^"]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }
      
      // If no image found, use a high-quality Unsplash fallback based on keywords
      if (!imageUrl) {
          const query = title.split(' ').slice(0, 3).join(',') || topic.category;
          imageUrl = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&keyword=${encodeURIComponent(query)}`;
          
          // Better category-specific fallbacks
          if (topic.category === 'Sports') {
            imageUrl = `https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800&keyword=sports`;
          } else if (topic.category === 'World' || title.includes('War')) {
            imageUrl = `https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&q=80&w=800&keyword=news,world`;
          } else if (topic.category === 'Technology') {
            imageUrl = `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800&keyword=technology`;
          } else if (topic.category === 'Business') {
            imageUrl = `https://images.unsplash.com/photo-1611974714851-eb605161aca8?auto=format&fit=crop&q=80&w=800&keyword=finance`;
          }
      }
      
      articles.push({
        title,
        description: description.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...',
        imageUrl,
        sourceUrl: link,
        sourceName: source || 'Google News',
        category: topic.category,
        scale: 'international',
        publishedAt: new Date(pubDate).toISOString(),
      });
    });
    
    return articles;
  }
}
