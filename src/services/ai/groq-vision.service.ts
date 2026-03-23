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

    try {
      // ─── DEEP FORENSICS PROMPT ───
      // Two-phase: first describe, then score
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
- Localized color/brightness adjustments: patches that differ unnaturally from surrounding pixels (histogram discontinuities)
- Splicing tells: inconsistent lighting across separate zones, horizon level mismatch
- Warping or stretching of specific regions (perspective distortion)
- Color grading inconsistencies (one area appears differently processed)
- Noise level mismatch: one region is far sharper or blurrier than surrounding areas
- Text or logo insertion: fonts that don't match image resolution, jagged anti-aliasing

=== PHASE 3: CONTEXTUAL CREDIBILITY ===
- What is the claimed or implied event in the image?
- Are there contextual inconsistencies (wrong season, wrong location visual cues, crowd too sparse/dense)?
- Does the composition suggest staged photography?

=== PHASE 4: MANIPULATION CONFIDENCE SCORING ===
Weight your score carefully:
- Unedited original photo = 85-100
- Minor benign edits (crop, brightness/contrast globally) = 70-84
- Suspicious but inconclusive = 45-69
- Likely manipulated (localized region edits, cloning, text insertion) = 20-44
- Clearly fake / AI-generated / heavily manipulated = 0-19

CRITICAL: Return ONLY valid JSON, no markdown, no backticks, no extra text:
{
  "authenticity_score": <Number 0-100>,
  "ai_generated_probability": <Number 0-100>,
  "manipulation_detected": <true|false>,
  "manipulation_types": ["list", "of", "detected", "manipulation", "types"],
  "suspicious_regions": ["describe any suspicious regions briefly"],
  "explanation": "<4-5 precise sentences: what the image shows, what specific artifacts were found, and your confidence reasoning>",
  "sources_analyzed": [
    { "name": "Groq Llama 3.2 Vision Forensics", "url": "", "stance": "supporting" }
  ],
  "extracted_claim": "<The factual event or claim the image is portraying>"
}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.2-90b-vision-instruct",
          temperature: 0.05, // Very low temp for consistent forensic analysis
          max_tokens: 1024,
          messages: [
            {
              role: "system",
              content: "You are a strict digital forensics AI. You analyze images for manipulation, fakery, or AI-generation. You output ONLY valid JSON with no markdown. You are trained to detect subtle cloning, splicing, color edits, and any suspicious artifacts."
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
        const errorMsg = data.error?.message || JSON.stringify(data);
        console.error("Groq Vision API Error:", errorMsg);
        return this.mockSynthesize("API Error: " + errorMsg);
      }

      let rawContent = data.choices[0].message.content;
      rawContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(rawContent);

      // Post-processing: if manipulation_detected is true but authenticity_score is too high, correct it
      if (parsed.manipulation_detected && parsed.authenticity_score > 70) {
        parsed.authenticity_score = Math.min(parsed.authenticity_score, 64);
        parsed.explanation = `[Forensic correction applied] ${parsed.explanation}`;
      }

      return parsed;
    } catch (error: any) {
      console.error("Groq Vision Code Error:", error);
      return this.mockSynthesize("Code Error: " + error.message);
    }
  }

  private mockSynthesize(errStr: string = "API Unavailable") {
    return {
      authenticity_score: 50,
      ai_generated_probability: 50,
      manipulation_detected: false,
      manipulation_types: [],
      suspicious_regions: [],
      explanation: `[DEBUG: ${errStr}] Your image was uploaded but the vision model encountered an error. Please check your GROQ_API_KEY.`,
      sources_analyzed: [
        { name: "System Debugger", url: "", stance: "neutral" }
      ],
      extracted_claim: "Error during Vision processing."
    };
  }
}
