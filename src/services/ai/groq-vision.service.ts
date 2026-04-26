// src/services/ai/groq-vision.service.ts
// Enhanced Image Forensics Engine
// Detects: AI-generation, copy-paste cloning, color/brightness edits, splicing, metadata manipulation

export class GroqVisionService {
  private apiKey = process.env.GROQ_API_KEY || '';

  async analyzeImage(imageUrl: string) {
    if (!this.apiKey || this.apiKey.includes('your_groq')) {
      console.warn("GROQ_API_KEY not set. Using mock vision synthesis.");
      return this.mockSynthesize();
    }

    const models = ["meta-llama/llama-4-scout-17b-16e-instruct"];

    
    for (const model of models) {
      try {
        console.log(`[GroqVision] Trying model: ${model}`);
        const result = await this.executeAnalysis(imageUrl, model);
        if (result && !result.isError) return result;
      } catch (error: any) {
        console.warn(`[GroqVision] ${model} failed: ${error.message}`);
      }
    }

    return this.mockSynthesize("All Groq vision models failed or are inaccessible.");
  }

  private async executeAnalysis(imageUrl: string, model: string) {
    // ─── DEEP FORENSICS PROMPT ───
    const prompt = `You are an elite digital forensics expert specializing in image manipulation detection and misinformation analysis.

Perform a DEEP forensic examination of this image. You MUST examine all of these dimensions:

=== PHASE 1: AI GENERATION ANALYSIS ===
- Unnatural skin texture or over-smoothness (plasticky faces)
- Misaligned or malformed hands, fingers, ears, teeth
- Weird eyes (glass-eye effect, mismatched symmetry, odd reflections)
- Background incoherence: warped straight lines, blurred depth inconsistencies
- Gibberish or impossible text within the image
- Inconsistent light source directions or shadows

=== PHASE 2: PHOTO MANIPULATION ANALYSIS ===
- Cloning artefacts: repeated patches, textures, or background patterns
- Copy-paste evidence: sharp edges with halos, inconsistent JPEG compression noise, mismatched grain patterns
- Localized color/brightness adjustments: patches that differ unnaturally from surrounding pixels
- Splicing tells: inconsistent lighting across separate zones, horizon level mismatch

=== PHASE 3: MANIPULATION CONFIDENCE SCORING ===
Weight your score carefully:
- Unedited original photo = 85-100
- Minor benign edits = 70-84
- Likely manipulated = 20-44
- Clearly fake / AI-generated = 0-19

CRITICAL: Return ONLY valid JSON:
{
  "authenticity_score": <Number 0-100>,
  "ai_generated_probability": <Number 0-100>,
  "manipulation_detected": <true|false>,
  "manipulation_types": ["list"],
  "suspicious_regions": ["list"],
  "explanation": "<4-5 sentences>",
  "sources_analyzed": [{ "name": "Groq Llama 3.2 Vision Forensics", "url": "", "stance": "supporting" }],
  "extracted_claim": "<event description>"
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: model,
        temperature: 0.05,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: "You are a strict digital forensics AI. You output ONLY valid JSON."
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || "API Error");
    }

    let rawContent = data.choices[0].message.content;
    rawContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(rawContent);
    return { ...parsed, isError: false };
  }

  private mockSynthesize(errStr: string = "API Unavailable") {
    return {
      isError: true,
      authenticity_score: 50,
      ai_generated_probability: 50,
      manipulation_detected: false,
      manipulation_types: [],
      suspicious_regions: [],
      explanation: `[Vision Engine Error] ${errStr}`,
      sources_analyzed: [
        { name: "System Debugger", url: "", stance: "neutral" }
      ],
      extracted_claim: "Error during Vision processing."
    };
  }
}
