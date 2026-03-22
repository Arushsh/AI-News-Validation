// src/services/search/tavily.service.ts

export class TavilySearchService {
  private apiKey = process.env.TAVILY_API_KEY || '';

  async searchContext(query: string) {
    if (!this.apiKey || this.apiKey.includes('your_tavily')) {
      console.warn("TAVILY_API_KEY not set. Using mock live search results.");
      return this.mockSearch();
    }

    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: query,
          search_depth: "basic",
          include_answer: false,
          include_images: false,
          include_raw_content: false,
          max_results: 5 // Get the top 5 most relevant live headlines
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Tavily API Error:", data.error || data);
        return this.mockSearch();
      }

      // Format the results beautifully for Groq to read instantly
      if (!data.results || data.results.length === 0) return "No live search results found.";
      
      return data.results.map((r: any) => `Title: ${r.title}\nContent: ${r.content}\nURL: ${r.url}`).join('\n\n');
    } catch (error) {
      console.error("Tavily Code Error:", error);
      return this.mockSearch();
    }
  }

  private mockSearch() {
    return `
Title: India wins Men's T20 World Cup 2026
Content: India beats their competitor in a thrilling final to secure the 2026 ICC Men's T20 World Cup title. The entire nation celebrates this massive international victory.
URL: https://espncricinfo.com/fake-news-demo`;
  }
}
