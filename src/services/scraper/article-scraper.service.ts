// src/services/scraper/article-scraper.service.ts
import * as cheerio from 'cheerio';

export class ArticleScraperService {
  async scrapeArticle(url: string): Promise<string> {
    try {
      // Validate URL
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error("Only HTTP/HTTPS URLs are supported.");
      }

      const response = await fetch(url, {
        headers: {
          // Mimic a real browser to bypass basic bot blocks
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove noise elements
      $('script, style, nav, footer, header, aside, .ad, .advertisement, .sidebar, noscript').remove();

      // Try to find the main article content using common article selectors
      const selectors = ['article', '[role="main"]', 'main', '.article-body', '.story-body', '.post-content', '.entry-content', '#content'];
      let text = '';

      for (const selector of selectors) {
        const el = $(selector);
        if (el.length > 0) {
          text = el.text();
          break;
        }
      }

      // Fallback to full body text
      if (!text) text = $('body').text();

      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();

      // Truncate to 4000 chars for the AI (token limit friendly)
      if (text.length > 4000) text = text.substring(0, 4000) + '...';

      if (!text || text.length < 50) {
        throw new Error("Could not extract readable text from this URL.");
      }

      return text;
    } catch (error: any) {
      console.error("Article Scraper Error:", error.message);
      throw new Error(error.message || "Failed to scrape article.");
    }
  }
}
