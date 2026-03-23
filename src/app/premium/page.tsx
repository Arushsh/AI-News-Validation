"use client";
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const FEATURES_VIDEO = [
  { icon: '🎭', title: 'Deepfake Face Detection', desc: 'Frame-by-frame facial mesh analysis using 3D landmark modeling to spot synthetic content with 99.1% precision.' },
  { icon: '👁️', title: 'Eye-Blink Pattern Analysis', desc: 'Detects unnaturally consistent blink patterns that are a key marker of AI-generated video avatars.' },
  { icon: '🧬', title: 'Neural Fingerprinting', desc: 'Identifies generation artifacts left by specific GAN or Diffusion models at the pixel level.' },
  { icon: '🔊', title: 'Audio-Video Sync Forensics', desc: 'Verifies lip-sync correlation between audio waveforms and facial movement to catch out-of-sync dubs.' },
  { icon: '📐', title: 'Compression Artifact Analysis', desc: 'Locates inconsistencies in JPEG blocks and DCT coefficients that reveal post-processing manipulation.' },
  { icon: '🌊', title: 'Optical Flow Mapping', desc: 'Analyzes motion consistency across frames to identify warping or unnatural movement typical of face-swaps.' },
];
const FEATURES_AUDIO = [
  { icon: '🎙️', title: 'Voice Cloning Detection', desc: 'Analyzes prosody, formant transitions, and pitch micro-variations to identify synthesized speech from TTS systems.' },
  { icon: '🌡️', title: 'Thermal Noise Profiling', desc: 'Examines the spectral baseline noise floor for unnatural smoothness characteristic of AI-generated voice.' },
  { icon: '🎼', title: 'Mel-Spectrogram Analysis', desc: 'Machine learning on Mel-frequency cepstral coefficients to distinguish human vocal tracts from neural models.' },
  { icon: '💬', title: 'Phoneme Boundary Inspection', desc: 'Detects unnatural phoneme boundaries and micro-pauses that are hallmarks of Text-To-Speech synthesis.' },
  { icon: '🔬', title: 'Environment Fingerprinting', desc: 'Identifies mismatched room acoustics or inconsistent background noise across voice segments.' },
  { icon: '⚡', title: 'Real-Time Stream Analysis', desc: 'Supports streaming audio forensics to flag manipulated content during live broadcasts and calls.' },
];
const FEATURES_DOC = [
  { icon: '✍️', title: 'Handwriting Forgery Detection', desc: 'Pen pressure, stroke velocity, and tremor pattern analysis to authenticate handwritten signatures and text.' },
  { icon: '📷', title: 'Image Splice Detection', desc: 'ELA (Error Level Analysis) and PRNU fingerprinting to detect copy-paste or cloned regions in document imagery.' },
  { icon: '📋', title: 'Font Inconsistency Mapping', desc: 'Identifies subtle kerning, spacing, and glyph rendering differences that reveal text has been altered or injected.' },
  { icon: '🧾', title: 'Metadata Chain of Custody', desc: 'Reconstructs document version history from embedded metadata to verify authorship and untampered state.' },
  { icon: '🔏', title: 'Seal & Stamp Verification', desc: 'Compares official seals and stamps against known authority registries to identify counterfeits.' },
  { icon: '🤖', title: 'AI Text Generation Detection', desc: 'Identifies LLM-generated text fragments within documents using perplexity and burstiness analysis.' },
];

const VIDEO_ACCENT  = { primary: '#60A5FA', dim: 'rgba(96, 165, 250, 0.12)' };
const AUDIO_ACCENT  = { primary: '#A78BFA', dim: 'rgba(167, 139, 250, 0.12)' };
const DOC_ACCENT    = { primary: '#FCD34D', dim: 'rgba(252, 211, 77, 0.10)' };

// ─── Coming Soon Modal ───
function ComingSoonModal({ feature, accentColor, onClose }: { feature: any; accentColor: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', animation: 'modalFadeIn 0.2s ease'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0A0A0F', border: `1px solid ${accentColor}40`,
        borderRadius: 24, padding: '48px 40px', maxWidth: 480, width: '90%', textAlign: 'center',
        boxShadow: `0 0 80px ${accentColor}25, 0 32px 64px rgba(0,0,0,0.6)`,
        position: 'relative', animation: 'modalSlideUp 0.25s ease',
      }}>
        {/* Glow top line */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}80, transparent)` }} />

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${accentColor}18`, border: `1px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>
          {feature.icon}
        </div>

        {/* Coming Soon Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 999, background: `${accentColor}15`, border: `1px solid ${accentColor}40`, marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}`, animation: 'pulse 2s infinite', display: 'inline-block' }} />
          <span style={{ fontSize: '0.65rem', fontFamily: 'Syne, sans-serif', fontWeight: 900, letterSpacing: '0.12em', color: accentColor }}>COMING SOON</span>
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: 12 }}>{feature.title}</h2>
        <p style={{ color: '#8A8AA0', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 36 }}>{feature.desc}</p>

        <p style={{ color: '#5A5A7A', fontSize: '0.8rem', marginBottom: 28 }}>
          This feature is currently under development. Join the waitlist to get early access when it launches.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 999, background: accentColor, color: '#000', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none' }}>
            Join Waitlist →
          </Link>
          <button onClick={onClose} style={{ padding: '11px 24px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9A9AB0', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent, onOpen }: any) {
  return (
    <button onClick={() => onOpen({ icon, title, desc })} style={{
      background: 'rgba(15, 15, 20, 0.8)', border: `1px solid ${accent.dim}`, borderRadius: 16,
      padding: '24px', backdropFilter: 'blur(12px)', transition: 'all 0.3s ease',
      position: 'relative', overflow: 'hidden', textAlign: 'left', width: '100%', cursor: 'pointer',
    }} className="premium-feature-card">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${accent.primary}40, transparent)` }} />
      {/* Coming Soon pill on card */}
      <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 10px', borderRadius: 999, background: `${accent.primary}15`, border: `1px solid ${accent.primary}35`, fontSize: '0.58rem', fontFamily: 'Syne, sans-serif', fontWeight: 900, letterSpacing: '0.1em', color: accent.primary }}>
        SOON
      </div>
      <div style={{ fontSize: 26, marginBottom: 14 }}>{icon}</div>
      <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#EFEFEF', marginBottom: 8, fontSize: '0.95rem', letterSpacing: '-0.01em', paddingRight: 52 }}>{title}</h4>
      <p style={{ color: '#8A8A9A', fontSize: '0.8rem', lineHeight: 1.65 }}>{desc}</p>
    </button>
  );
}

function Tier({ id, badge, title, tagline, icon, features, accent, onOpen }: any) {
  return (
    <section style={{ marginBottom: 120, position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10%', left: id % 2 === 0 ? '5%' : 'auto', right: id % 2 !== 0 ? '5%' : 'auto', width: 500, height: 500, background: `radial-gradient(circle, ${accent.primary}55 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.18, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent.primary}18`, border: `1px solid ${accent.primary}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
              <div style={{ padding: '4px 12px', borderRadius: 999, background: `${accent.primary}18`, border: `1px solid ${accent.primary}44`, fontSize: '0.65rem', fontFamily: 'Syne, sans-serif', fontWeight: 900, letterSpacing: '0.12em', color: accent.primary }}>
                {badge}
              </div>
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em', color: '#FFFFFF', marginBottom: 10, lineHeight: 1.1 }}>{title}</h2>
            <p style={{ color: '#9A9AB0', fontSize: '1rem', maxWidth: 520, lineHeight: 1.7 }}>{tagline}</p>
          </div>
          {/* Highlighted Coming Soon badge */}
          <div style={{ flexShrink: 0, alignSelf: 'flex-start', padding: '9px 20px', borderRadius: 999, background: `${accent.primary}18`, border: `1px solid ${accent.primary}50`, fontSize: '0.7rem', fontFamily: 'Syne, sans-serif', fontWeight: 900, letterSpacing: '0.1em', color: accent.primary, display: 'flex', alignItems: 'center', gap: 8, boxShadow: `0 0 20px ${accent.primary}20` }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: accent.primary, boxShadow: `0 0 8px ${accent.primary}`, display: 'inline-block' }} />
            COMING SOON
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {features.map((f: any) => <FeatureCard key={f.title} {...f} accent={accent} onOpen={onOpen} />)}
        </div>
        <div style={{ marginTop: 80, height: 1, background: `linear-gradient(90deg, transparent, ${accent.primary}30, transparent)` }} />
      </div>
    </section>
  );
}

export default function PremiumPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [modalFeature, setModalFeature] = useState<any>(null);
  const [modalAccent, setModalAccent] = useState('#60A5FA');
  const heroRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const openModal = (accent: string) => (feature: any) => {
    setModalAccent(accent);
    setModalFeature(feature);
  };

  return (
    <main style={{ background: '#000000', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalSlideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .premium-feature-card:hover {
          border-color: rgba(255,255,255,0.18) !important;
          background: rgba(22, 22, 30, 0.9) !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }
        @media (max-width: 768px) { .hero-stats { flex-wrap: wrap !important; } .hero-stats > div { min-width: 120px; } }
      `}</style>

      {/* Modal */}
      {modalFeature && <ComingSoonModal feature={modalFeature} accentColor={modalAccent} onClose={() => setModalFeature(null)} />}

      {/* ─── HERO ─── */}
      <section ref={heroRef} onMouseMove={handleMouseMove} style={{ position: 'relative', padding: '160px 24px 120px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: mousePos.y - 200, left: mousePos.x - 200, width: 400, height: 400, background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', transition: 'top 0.08s ease, left 0.08s ease', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70%', height: 500, background: 'radial-gradient(ellipse at center, rgba(96,165,250,0.05) 0%, rgba(167,139,250,0.04) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', marginBottom: 36 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA', boxShadow: '0 0 8px #60A5FA' }} />
            <span style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 900, letterSpacing: '0.12em', color: '#60A5FA' }}>ADVANCED FORENSICS SUITE</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, color: '#FFFFFF' }}>
            Next-Generation<br /><span style={{ color: '#404060' }}>Truth Intelligence.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#8A8AA0', lineHeight: 1.7, maxWidth: 600, marginTop: 0, marginRight: 'auto', marginBottom: 52, marginLeft: 'auto' }}>
            A suite of cutting-edge forensic AI engines built for investigators, journalists, and institutions who demand the highest level of content authenticity assurance.
          </p>
          <div className="hero-stats" style={{ display: 'inline-flex', gap: 0, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'rgba(10,10,16,0.8)', backdropFilter: 'blur(12px)' }}>
            {[
              { val: '99.1%', label: 'Detection Accuracy', color: '#60A5FA' },
              { val: '< 45s',  label: 'Analysis Time',      color: '#A78BFA' },
              { val: '12+',   label: 'AI Models',           color: '#FCD34D' },
              { val: '3',     label: 'Forensic Engines',    color: '#34D399' },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: '20px 28px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: s.color, letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: '0.7rem', color: '#5A5A7A', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIERS ─── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Tier id={1} badge="ENGINE 01 · VIDEO" title="Deep Forensic Video Analysis"
          tagline="Multi-layer temporal and spatial AI analysis to unmask deepfakes, face-swaps, and synthetically generated video content at sub-frame resolution."
          icon="🎥" features={FEATURES_VIDEO} accent={VIDEO_ACCENT} onOpen={openModal(VIDEO_ACCENT.primary)} />
        <Tier id={2} badge="ENGINE 02 · AUDIO" title="Audio Forensic Intelligence"
          tagline="State-of-the-art spectral and prosodic analysis that pierces through voice-cloning, synthetic speech, and AI-altered audio across any medium."
          icon="🎧" features={FEATURES_AUDIO} accent={AUDIO_ACCENT} onOpen={openModal(AUDIO_ACCENT.primary)} />
        <Tier id={3} badge="ENGINE 03 · DOCUMENTS" title="Deep Document Intelligence"
          tagline="Pixel-perfect forensic examination of documents, images, and metadata to uncover forgeries, tampering, and AI-generated text injections."
          icon="📄" features={FEATURES_DOC} accent={DOC_ACCENT} onOpen={openModal(DOC_ACCENT.primary)} />
      </div>

      {/* ─── CTA ─── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(96,165,250,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 999, border: '1px solid rgba(96,165,250,0.25)', background: 'rgba(96,165,250,0.07)', fontSize: '0.65rem', fontFamily: 'Syne, sans-serif', fontWeight: 900, letterSpacing: '0.12em', color: '#60A5FA', marginBottom: 28 }}>
            EARLY ACCESS WAITLIST
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em', color: '#FFFFFF', marginBottom: 16 }}>Be First to Access</h2>
          <p style={{ color: '#8A8AA0', fontSize: '1rem', maxWidth: 480, marginTop: 0, marginRight: 'auto', marginBottom: 40, marginLeft: 'auto', lineHeight: 1.7 }}>
            Join the waitlist for priority access when our Advanced Forensics Suite launches.
          </p>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 999, background: '#FFFFFF', color: '#000000', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}>
            Request Early Access →
          </Link>
        </div>
      </section>
    </main>
  );
}
