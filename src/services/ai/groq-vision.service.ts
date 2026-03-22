// src/services/ai/groq-vision.service.ts

export class GroqVisionService {
  private apiKey = process.env.GROQ_API_KEY || '';

  async analyzeImage(imageUrl: string) {
    if (!this.apiKey || this.apiKey.includes('your_groq')) {
       console.warn("GROQ_API_KEY not set. Using mock vision synthesis.");
       return this.mockSynthesize();
    }

    try {
      const prompt = `
      You are an expert digital forensics analyst and fact-checker. 
      Analyze the provided image completely. 
      
      Look for:
      1. AI-generated artifacts (weird hands, mismatched lighting, text gibberish, unnatural smoothness, warped background elements).
      2. The primary factual claim or event being depicted (e.g. "A politician being arrested", "A natural disaster in a city").
      
      Based purely on visual analysis, return ONLY a JSON object with this exact structure:
      {
        "authenticity_score": Number (0-100, where 0 is clearly fake/AI, 100 is real authentic photo),
        "ai_generated_probability": Number (0-100),
        "explanation": "A strict 3-sentence explanation of what the image shows, and what key visual artifacts prove it is real or fake.",
        "sources_analyzed": [
           { "name": "Llama 3.2 90B Vision Scan", "url": "", "stance": "supporting" }
        ],
        "extracted_claim": "The core factual event or claim the image is trying to portray"
      }`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.2-90b-vision-instruct",
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt + "\\n\\nCRITICAL: You must output ONLY valid JSON. Do not include markdown formatting or backticks." },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMsg = data.error?.message || JSON.stringify(data);
        console.error("Groq Vision API Rejected Request:", errorMsg);
        return this.mockSynthesize("API Rejected: " + errorMsg);
      }

      let rawContent = data.choices[0].message.content;
      // Strip markdown backticks in case the model returns them anyway
      rawContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
      
      return JSON.parse(rawContent);
    } catch (error: any) {
      console.error("Groq Vision Code Error:", error);
      return this.mockSynthesize("Code Error: " + error.message);
    }
  }

  private mockSynthesize(errStr: string = "Unknown API Error") {
    return {
      authenticity_score: 50,
      ai_generated_probability: 50,
      explanation: `[DEBUG INFO: ${errStr}] Your image was successfully uploaded, but the AI vision model threw an error rejecting the scan.`,
      sources_analyzed: [
         { name: "System Debugger", url: "", stance: "neutral" }
      ],
      extracted_claim: "Error during Vision processing."
    };
  }
}

