// src/services/ai/huggingface.service.ts

// Model waterfall (most accurate to least accurate):
// 1. Organika/sdxl-detector          — trained on SDXL/DALL-E/Midjourney diffusion images (new)
// 2. haywoodsloan/ai-image-detector  — multi-generator training including Midjourney
// 3. dima806/deepfake_vs_real_image_detection — fallback (older GAN-based, legacy)
const MODELS = [
  "Organika/sdxl-detector",
  "haywoodsloan/ai-image-detector",
  "dima806/deepfake_vs_real_image_detection"
];

export class HuggingFaceService {
  private apiKey = process.env.HUGGINGFACE_API_KEY || '';

  async analyzeDeepfake(base64Data: string) {
    if (!this.apiKey || this.apiKey.includes('your_huggingface')) {
      console.warn("HUGGINGFACE_API_KEY not set. Using mock HF response.");
      return this.buildResult(50, 50, "No API key set.", "");
    }

    const base64String = base64Data.split(',')[1];
    const imageBuffer = Buffer.from(base64String, 'base64');

    // Try each model in cascade until one succeeds
    for (const model of MODELS) {
      console.log(`[HF] Trying model: ${model}`);
      try {
        const response = await fetch(
          `https://router.huggingface.co/hf-inference/models/${model}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.apiKey}`,
              "Content-Type": "application/octet-stream"
            },
            body: imageBuffer
          }
        );

        // Catch HTML redirects caused by missing inference permissions
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("text/html")) {
          console.warn(`[HF] ${model}: Auth redirect – check token has Inference: Make calls to Inference Providers.`);
          continue;
        }

        const result = await response.json();

        // Model is cold-booting (503)
        if (response.status === 503) {
          console.warn(`[HF] ${model}: Loading (${result.estimated_time}s) – trying next.`);
          continue;
        }

        // Error in response
        if (!response.ok || result.error) {
          console.warn(`[HF] ${model}: Error →`, result.error, "– trying next.");
          continue;
        }

        // Unexpected format
        if (!Array.isArray(result)) {
          console.warn(`[HF] ${model}: Unexpected format →`, result, "– trying next.");
          continue;
        }

        console.log(`[HF] SUCCESS with ${model}:`, result);

        // Normalize label variations across different model card naming conventions
        const fakeEntry = result.find((r: any) =>
          /fake|artificial|ai|generated|1/.test(r.label.toLowerCase())
        );
        const realEntry = result.find((r: any) =>
          /real|natural|human|camera|0/.test(r.label.toLowerCase())
        );

        const fakeScore = fakeEntry?.score ?? (1 - (realEntry?.score ?? 0));
        const realScore = 1 - fakeScore;
        const modelShortName = model.split('/')[0];

        return this.buildResult(
          Math.round(realScore * 100),
          Math.round(fakeScore * 100),
          "",
          model
        );

      } catch (err: any) {
        console.warn(`[HF] ${model}: Exception – ${err.message} – trying next.`);
        continue;
      }
    }

    return this.buildResult(50, 50, "All AI detection models currently sleeping. Please try again in 30 seconds.", "");
  }

  private buildResult(authentic: number, aiProb: number, err: string, model: string) {
    const modelShortName = model ? model.split('/')[0] : "System";
    const explanation = err
      ? err
      : aiProb > 50
        ? `${modelShortName} AI detector identified synthetic diffusion-model generation patterns with ${aiProb}% confidence.`
        : `${modelShortName} AI detector found no significant synthetic generation artifacts (${authentic}% authenticity confidence).`;


    return {
      authenticity_score: authentic,
      ai_generated_probability: aiProb,
      explanation,
      sources_analyzed: [
        {
          name: model ? `Hugging Face: ${model}` : "System Fallback",
          url: model ? `https://huggingface.co/${model}` : "",
          stance: aiProb > 50 ? "contradicting" : "supporting"
        }
      ],
      extracted_claim: "Forensic scan of uploaded image for AI-generation artifacts."
    };
  }
}
