import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Share2, Download, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { useState } from 'react';

export function ResultDashboard({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);

  // Normalize field names — Groq/HF models occasionally return different key names
  const authScore: number =
    data.authenticity_score ??
    data.authenticity ??
    data.real_score ??
    data.score ??
    (data.ai_generated_probability != null ? 100 - data.ai_generated_probability : 50);

  const aiProb: number =
    data.ai_generated_probability ??
    data.ai_probability ??
    data.fake_score ??
    (100 - authScore);

  const explanation: string =
    data.explanation ?? data.summary ?? data.reason ?? "No explanation provided.";

  const sources: any[] = data.sources_analyzed ?? data.sources ?? [];

  const isFake = authScore < 40;
  const isReal = authScore > 70;

  const scoreColor = isFake ? 'text-red-500' : isReal ? 'text-emerald-400' : 'text-amber-400';
  const badgeBg = isFake
    ? 'bg-red-500/10 border-red-500/20'
    : isReal
    ? 'bg-emerald-500/10 border-emerald-500/20'
    : 'bg-amber-500/10 border-amber-500/20';
  const verdict = isFake ? 'Likely False' : isReal ? 'Likely Authentic' : 'Inconclusive';

  // Feature A: Share
  const handleShare = async () => {
    const text = `VerifyLens Result\nVerdict: ${verdict}\nAuthenticity: ${authScore}%\n\n${explanation}\n\nVerify at: https://verifylens.app`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(text);
    }
  };

  // Feature D: Download PDF
  const handleDownload = async () => {
    const { downloadVerificationPDF } = await import('@/lib/pdf-export');
    await downloadVerificationPDF({ ...data, authenticity_score: authScore, ai_generated_probability: aiProb, explanation, sources_analyzed: sources });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-3xl mt-8 rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60 overflow-hidden text-white"
    >
      {/* Score Header */}
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-neutral-800 bg-neutral-900">
        {/* Feature B: Animated Score Gauge */}
        <div className="flex-1 px-8 py-8 flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Authenticity Score</p>
          <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
            <ScoreGauge score={authScore} size={180} />
          </div>
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${badgeBg} ${scoreColor}`}>
            {isFake ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            {verdict}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 px-8 py-8 flex flex-col justify-center gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">AI-Generated Probability</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-neutral-200">{aiProb}<span className="text-2xl">%</span></span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-neutral-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${aiProb}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full ${aiProb > 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-1.5">
              <AlertTriangle className={`inline w-3 h-3 mr-1 ${aiProb > 60 ? 'text-amber-400' : 'text-neutral-600'}`} />
              {aiProb > 60 ? 'High AI likelihood detected' : 'Likely human-authored content'}
            </p>
          </div>

          {/* Feature A & D action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm font-semibold text-neutral-300 transition-all"
            >
              {copied ? <><Check className="w-4 h-4 text-emerald-400" />Copied!</> : <><Share2 className="w-4 h-4" />Share Result</>}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm font-semibold text-neutral-300 transition-all"
            >
              <Download className="w-4 h-4" />Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-neutral-950/80 px-8 py-6 border-t border-neutral-800 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 rounded-r" />
        <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-3">AI Explanation</h3>
        <p className="text-neutral-200 leading-relaxed">{explanation}</p>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="bg-neutral-900/60 px-8 py-6 border-t border-neutral-800">
          <h3 className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-4">
            Sources Analyzed ({sources.length})
          </h3>
          <div className="space-y-2">
            {sources.map((src: any, i: number) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors gap-2"
              >
                <span className="text-neutral-200 font-medium text-sm">
                  {src.name || src.publisher}
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noreferrer" className="ml-2 text-blue-500 hover:text-blue-400 text-xs">
                      ↗ View Source
                    </a>
                  )}
                </span>
                <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wider w-fit ${
                  src.stance === 'supporting' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : src.stance === 'contradicting' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {src.stance || src.rating || 'neutral'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
