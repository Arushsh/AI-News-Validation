export class AudioDeepfakeService {
  private apiKey = process.env.HUGGINGFACE_API_KEY || '';

  async analyzeDeepfake(buffer: Buffer) {
    if (!this.apiKey) {
      throw new Error("Missing HUGGINGFACE_API_KEY for audio detection.");
    }

    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/MelodyMachine/Deepfake-audio-detection-V2",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/octet-stream"
          },
          body: new Uint8Array(buffer)
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Audio deepfake model failed");

      // Model returns array: [{label: 'real', score: 0.1}, {label: 'fake', score: 0.9}]
      const fakeEntry = result.find((r: any) => r.label.toLowerCase().includes('fake') || r.label.toLowerCase().includes('spoof'));
      const fakeProb = fakeEntry ? Math.round(fakeEntry.score * 100) : 50;
      const authenticScore = 100 - fakeProb;

      return {
        authenticity_score: authenticScore,
        ai_generated_probability: fakeProb,
        explanation: fakeProb > 50 
          ? `HuggingFace Audio Deepfake Detector identified synthetic vocal patterns with ${fakeProb}% confidence.`
          : `HuggingFace Audio Deepfake Detector verified this as natural human speech with ${authenticScore}% confidence.`,
        sources_analyzed: [{ name: "Hugging Face: MelodyMachine/Deepfake-audio-detection-V2", url: "https://huggingface.co/MelodyMachine/Deepfake-audio-detection-V2", stance: fakeProb > 50 ? "contradicting" : "supporting" }],
        extracted_claim: `Spectral voice analysis`
      };
    } catch (e: any) {
      throw new Error(`Audio API Error: ${e.message}`);
    }
  }
}
