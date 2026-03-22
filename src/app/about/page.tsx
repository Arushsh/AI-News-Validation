"use client";
import { Zap, Users, Link as LinkIcon, Target } from 'lucide-react';
import { Card } from '@/components/ui/primitives';

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 1024, margin: '0 auto', padding: '80px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 80 }}>
        <h1 className="font-syne" style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--text-primary)' }}>
          Why Verify<span className="text-gradient">Lens?</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
          Bridging the gap between misinformation and truth through instant, accessible, and unified AI verification.
        </p>
      </div>

      {/* Challenges Section */}
      {/* <h2 className="font-syne" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 32, color: 'var(--text-primary)', textAlign: 'center' }}>The Challenge</h2> */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32, marginBottom: 80 }} className="about-grid">
        <Card style={{ padding: 40, background: 'linear-gradient(180deg, var(--bg-surface), var(--bg-card))', borderTop: '4px solid var(--fake)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--fake-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={24} color="var(--fake)" />
            </div>
            <h3 className="font-syne" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Lack of Real-Time Verification</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-md)' }}>
            Most existing solutions are not designed for instant decision-making. Users often have to spend significant time searching, comparing, and interpreting information. In a fast-moving digital environment, this delay allows misinformation to spread rapidly before it can be verified.
          </p>
        </Card>

        <Card style={{ padding: 40, background: 'linear-gradient(180deg, var(--bg-surface), var(--bg-card))', borderTop: '4px solid var(--suspicious)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} color="var(--suspicious)" />
            </div>
            <h3 className="font-syne" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Limited Accessibility for Users</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-md)' }}>
            Current tools are either too technical or require prior knowledge to interpret results effectively. There is a clear gap in providing a simple, intuitive system that can be used by anyone — from students to professionals — without requiring expertise in media verification.
          </p>
        </Card>
      </div>

      {/* Solutions Section */}
      {/* <h2 className="font-syne" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 32, color: 'var(--text-primary)', textAlign: 'center' }}>Our Solution</h2> */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 32 }} className="about-grid">
        <Card style={{ padding: 40, background: 'linear-gradient(180deg, var(--bg-surface), var(--bg-card))', borderTop: '4px solid var(--cyan)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LinkIcon size={24} color="var(--cyan)" />
            </div>
            <h3 className="font-syne" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Our Unified Approach</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-md)' }}>
            VerifyLens addresses these challenges by combining AI-driven analysis with multi-source verification into a single platform. Instead of relying on one method, it integrates multiple signals to provide a comprehensive credibility assessment, making the verification process seamless and efficient.
          </p>
        </Card>

        <Card style={{ padding: 40, background: 'linear-gradient(180deg, var(--bg-surface), var(--bg-card))', borderTop: '4px solid var(--verified)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--verified-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color="var(--verified)" />
            </div>
            <h3 className="font-syne" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Clear, Actionable Insights</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 'var(--text-md)' }}>
            Rather than presenting raw data, VerifyLens delivers a clear credibility score along with supporting sources and explanations. This enables users to quickly understand not just the result, but the reasoning behind it, empowering them to make informed decisions with confidence.
          </p>
        </Card>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
