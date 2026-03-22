// src/services/ai/language-detect.ts
// Feature E — Auto-detect input language via Groq and translate the prompt/response

export async function detectLanguage(text: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY || '';
  if (!apiKey || apiKey.includes('your_groq')) return 'en';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Detect the language of this text and reply with ONLY the 2-letter ISO language code (e.g. "en", "hi", "es", "fr", "ar"). Text: "${text.substring(0, 200)}"`
        }],
        max_tokens: 5
      })
    });
    const data = await response.json();
    const code = data.choices?.[0]?.message?.content?.trim().toLowerCase().slice(0, 2);
    return code && /^[a-z]{2}$/.test(code) ? code : 'en';
  } catch {
    return 'en';
  }
}

export function buildMultilingualPrompt(claim: string, lang: string, factCheckData: any, searchContext: string, supportingArticles: any[] = []): string {
  const langMap: Record<string, string> = {
    hi: 'Hindi', es: 'Spanish', fr: 'French', ar: 'Arabic', zh: 'Chinese',
    de: 'German', pt: 'Portuguese', ru: 'Russian', ja: 'Japanese', ko: 'Korean'
  };
  const langName = langMap[lang] || 'English';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
  You are an expert fact-checker/journalist evaluating a news claim.
  TODAY'S DATE: ${today}

  Claim to verify: "${claim}"

  CONTEXTUAL EVIDENCE:
  1. Fact-Check Database Findings: ${JSON.stringify(factCheckData)}
  2. Live Web Snippets: ${searchContext}
  3. Trusted Local News Database Articles: ${JSON.stringify(supportingArticles.map(a => ({ title: a.title, source: a.sourceName, date: a.publishedAt })))}

  STRICT INSTRUCTIONS:
  - DO NOT HALLUCINATE. Only mention specific platforms or publishers (e.g. BBC, Reuters, HT) IF they explicitly appear in the CONTEXTUAL EVIDENCE above.
  - If the claim is about a future event or a win that hasn't happened yet relative to ${today}, be extremely skeptical.
  - In your "explanation", be specific about which provided sources support or contradict the claim.
  - Provide evidence-based "explanation" in ${langName}.

  SCORING LOGIC:
  - 90-100: Multiple high-authority sources in the evidence CLEARLY confirm the claim as a recent event.
  - 40-70: Mixed or weak evidence, or the event is in the future.
  - 0-30: Explicit contradictions or "debunked" findings in the evidence.

  Return ONLY a JSON object:
  {
    "category": "Sports|Politics|Technology|Business|Entertainment|Health|World|General",
    "authenticity_score": Number (0-100),
    "ai_generated_probability": Number (0-100),
    "explanation": "2-3 sentences in ${langName} summarizing based ONLY on the evidence provided above.",
    "sources_analyzed": [
       { "name": "Exact Source from Evidence", "url": "URL", "stance": "supporting|contradicting|neutral" }
    ]
  }`;
}
