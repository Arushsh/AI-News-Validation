// src/services/ai/groq.service.ts
import { detectLanguage, buildMultilingualPrompt } from './language-detect';

export class GroqService {
  private apiKey = process.env.GROQ_API_KEY || '';

  async synthesizeResults(claim: string, factCheckData: any, searchContext: string = "", supportingArticles: any[] = []) {
    if (!this.apiKey || this.apiKey.includes('your_groq')) {
      console.warn("GROQ_API_KEY not set. Using mock synthesis.");
      return this.mockSynthesize();
    }

    try {
      // Feature E: Auto-detect language for multilingual support
      const lang = await detectLanguage(claim);
      const prompt = buildMultilingualPrompt(claim, lang, factCheckData, searchContext, supportingArticles);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error("Groq API Rejected Request:", data.error?.message || data);
        return this.mockSynthesize();
      }

      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("Groq Code Error:", error);
      return this.mockSynthesize();
    }
  }

  private mockSynthesize() {
    return {
      authenticity_score: 25,
      ai_generated_probability: 80,
      explanation: "This is clear misinformation. Fact checkers uniformly dispute the premise, and image artifacts suggest an AI-generation.",
      sources_analyzed: [
        { name: "Reuters Fact Check", url: "https://reuters.com", stance: "contradicting" }
      ]
    };
  }
}
