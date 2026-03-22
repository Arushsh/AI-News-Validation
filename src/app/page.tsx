"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { NewsCard, PrimaryButton, SecondaryButton, Card } from '@/components/ui/primitives';
import { ArrowRight, CheckCircle, BarChart2, Cpu, TrendingUp } from 'lucide-react';
import { TrendingFeed } from '@/components/ui/TrendingFeed';

const STEPS = [
  { num: '01', icon: ArrowRight, title: 'Upload Content', desc: 'Paste text, share a URL, upload an image, PDF, audio or video. Any format supported.' },
  { num: '02', icon: Cpu, title: 'AI Analyzes', desc: '12 AI models run in parallel — fact-checking, bias detection, sentiment, and source credibility scoring.' },
  { num: '03', icon: BarChart2, title: 'Get Your Score', desc: 'Receive a 0–100 authenticity score, VERIFIED/SUSPICIOUS/FAKE stamp, and full breakdown report.' },
];

const CATEGORIES = [
  { label: 'Politics', icon: '🏛️', color: '#6366f1' },
  { label: 'Technology', icon: '💻', color: '#06b6d4' },
  { label: 'Sports', icon: '⚽', color: '#f59e0b' },
  { label: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { label: 'Business', icon: '📈', color: '#10b981' },
  { label: 'Health', icon: '🩺', color: '#84cc16' },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ totalVerified: '0', accuracy: '0%', sources: '0', models: '12' });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [overview, sourcesReq, recentReq] = await Promise.all([
          fetch('/api/analytics/overview').then(r => r.json()),
          fetch('/api/sources').then(r => r.json()),
          fetch('/api/verifications/recent').then(r => r.json())
        ]);

        if (!overview.error) {
          setStats(prev => ({
            ...prev,
            totalVerified: formatCount(overview.totalVerified),
            accuracy: (overview.avgAuthenticity || 0) + '%'
          }));
        }
        if (Array.isArray(sourcesReq)) {
          setStats(prev => ({ ...prev, sources: sourcesReq.length.toString() }));
        }
        if (Array.isArray(recentReq)) {
          setRecent(recentReq);
        }
      } catch (e) {
        console.error("Landing data fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  function formatCount(n: number) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M+';
    if (n >= 1000) return (n/1000).toFixed(1) + 'K+';
    return n.toString();
  };

  const STAT_CARDS = [
    { value: stats.totalVerified, label: 'Articles Verified' },
    { value: stats.accuracy, label: 'Accuracy Rate' },
    { value: stats.sources, label: 'Sources Tracked' },
    { value: stats.models, label: 'AI Models Running' },
  ];

  const HERO_SUBTEXT = stats.totalVerified === '0' 
    ? "Drop any news content — text, image, video, or URL — and receive an AI-backed authenticity score in seconds."
    : `Drop any news content to receive an AI-backed authenticity score in seconds. Trusted for ${stats.totalVerified} verifications.`;

  return (
    <main>
      {/* ── HERO ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 64px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:64, alignItems:'start' }} className="hero-grid">
          <div className="animate-fadeUp">
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:'var(--radius-full)', background:'var(--cyan-dim)', border:'1px solid var(--border-active)', marginBottom:24 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--cyan)', display:'inline-block' }} />
              <span style={{ fontSize:'var(--text-xs)', color:'var(--cyan)', fontFamily:'Syne, sans-serif', fontWeight:700, letterSpacing:'0.1em' }}>AI-POWERED TRUTH ENGINE</span>
            </div>
            <h1 className="font-syne" style={{ fontSize:'clamp(3rem, 6vw, 5rem)', fontWeight:900, lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:24, color:'var(--text-primary)' }}>
              Verify Before<br />
              <span className="text-gradient">You Share.</span>
            </h1>
            <p style={{ fontSize:'var(--text-lg)', color:'var(--text-secondary)', lineHeight:1.7, marginBottom:36, maxWidth:500 }}>
              {HERO_SUBTEXT}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:36 }}>
              <Link href="/upload">
                <PrimaryButton style={{ padding:'16px 32px', fontSize:'var(--text-md)' }} className="hover-lift">
                  Start Verifying Now →
                </PrimaryButton>
              </Link>
              <Link href="/feed">
                <SecondaryButton style={{ padding:'16px 32px', fontSize:'var(--text-md)' }} className="hover-lift">
                  Explore Trending
                </SecondaryButton>
              </Link>
            </div>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
              {['No account needed', 'Free to use', '12 AI models'].map(x => (
                <span key={x} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>
                  <CheckCircle size={15} color="var(--verified)" /> {x}
                </span>
              ))}
            </div>
          </div>

          <div className="hero-feed animate-fadeUp" style={{ animationDelay: '200ms' }}>
             <TrendingFeed />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background:'var(--bg-surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'32px 24px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }} className="stats-grid">
          {STAT_CARDS.map((s, i) => (
            <div key={s.label} style={{ textAlign:'center', padding:'16px 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div className="font-syne font-mono" style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)', fontWeight:900, color:'var(--cyan)', letterSpacing:'-0.02em' }}>{s.value}</div>
              <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'80px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <h2 className="font-syne" style={{ fontSize:'var(--text-3xl)', fontWeight:800, marginBottom:12 }}>How It Works</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-lg)', maxWidth:480, margin:'0 auto' }}>Three steps from confusion to clarity.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }} className="steps-grid">
          {STEPS.map(step => (
            <Card key={step.num} style={{ position:'relative', overflow:'hidden' }} className="hover-lift">
              <div className="font-syne" style={{ fontSize:48, fontWeight:900, color:'var(--bg-elevated)', position:'absolute', top:12, right:16, lineHeight:1 }}>{step.num}</div>
              <div style={{ width:44, height:44, borderRadius:'var(--radius-md)', background:'var(--cyan-dim)', border:'1px solid var(--border-active)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <step.icon size={22} color="var(--cyan)" />
              </div>
              <h3 className="font-syne" style={{ fontSize:'var(--text-xl)', fontWeight:700, marginBottom:10 }}>{step.title}</h3>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.6, fontSize:'var(--text-sm)' }}>{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CATEGORY GRID ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px 80px' }}>
        <h2 className="font-syne" style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:24 }}>Browse by Category</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }} className="cat-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} href={`/feed?cat=${cat.label}`} style={{ textDecoration:'none' }} className="hover-lift">
              <div style={{ padding:'20px 12px', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', background:'var(--bg-card)', textAlign:'center', cursor:'pointer', transition:'all 200ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = cat.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${cat.color}33`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{cat.icon}</div>
                <div style={{ fontSize:'var(--text-sm)', fontFamily:'Syne, sans-serif', fontWeight:700, color:'var(--text-primary)' }}>{cat.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── RECENT VERIFICATIONS ── */}
      <section style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px 80px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h2 className="font-syne" style={{ fontSize:'var(--text-2xl)', fontWeight:800 }}>Recent Verifications</h2>
          <Link href="/feed" style={{ color:'var(--cyan)', fontSize:'var(--text-sm)', fontWeight:600, textDecoration:'none' }}>View All →</Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }} className="recent-grid">
          {recent.length > 0 ? (
            recent.map((item, index) => <NewsCard key={item.title} {...item} index={index} />)
          ) : (
             Array.from({length:3}).map((_, i) => (
                <div key={i} className="skeleton" style={{ height:320, borderRadius:'var(--radius-lg)', background:'var(--bg-elevated)', border:'1px solid var(--border)' }} />
             ))
          )}
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{ background:'var(--bg-surface)', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'64px 24px', textAlign:'center' }}>
          <h2 className="font-syne" style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:900, marginBottom:20 }}>
            Stop Guessing. Start <span className="text-gradient">Knowing.</span>
          </h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-lg)', marginBottom:36, maxWidth:480, margin:'0 auto 36px' }}>
            Join readers who verify before they share. It only takes 3 seconds.
          </p>
          <Link href="/upload">
            <PrimaryButton style={{ padding:'16px 48px', fontSize:'var(--text-lg)' }} className="hover-lift">
              Verify Your First Story →
            </PrimaryButton>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:'1px solid var(--border)', background:'var(--bg-base)', padding:'80px 24px 40px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr repeat(3, 1fr)', gap:48, marginBottom:64 }} className="footer-grid">
            {/* Brand Column */}
            <div>
              <div className="font-syne" style={{ fontSize:24, fontWeight:900, color:'var(--text-primary)', marginBottom:20 }}>
                VERIDY<span style={{ color:'var(--cyan)' }}>X</span>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', lineHeight:1.6, maxWidth:240, marginBottom:24 }}>
                The world's most advanced AI-powered verification engine. Protecting the truth in the age of synthetic media.
              </p>
              <div style={{ display:'flex', gap:16 }}>
                {['Twitter', 'GitHub', 'LinkedIn'].map(s => (
                  <div key={s} style={{ width:32, height:32, borderRadius:'var(--radius-md)', background:'var(--bg-elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', cursor:'pointer' }}>
                    <div style={{ fontSize:10, fontWeight:800 }}>{s[0]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {[
              { title: 'Product', links: [['Verify Content', '/upload'], ['Global Feed', '/feed'], ['Analytics', '/analytics'], ['API Docs', '#']] },
              { title: 'Resources', links: [['Source Directory', '/sources'], ['Fact Check Tips', '#'], ['Community', '#'], ['Support', '#']] },
              { title: 'Company', links: [['About Us', '#'], ['Careers', '#'], ['Privacy', '#'], ['Terms', '#']] }
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-syne" style={{ fontSize:'var(--text-xs)', fontWeight:800, color:'var(--text-primary)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:20 }}>{col.title}</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', textDecoration:'none', transition:'color 0.2s' }}
                          onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--cyan)'}
                          onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop:'1px solid var(--border)', paddingTop:40, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
             <p style={{ color:'var(--text-muted)', fontSize:'var(--text-xs)' }}>© 2026 Veridex AI. All rights reserved.</p>
             <div style={{ display:'flex', gap:24 }}>
               <span style={{ color:'var(--text-muted)', fontSize:'var(--text-xs)' }}>Hardware by NVIDIA</span>
               <span style={{ color:'var(--text-muted)', fontSize:'var(--text-xs)' }}>Powered by Groq</span>
               <span style={{ color:'var(--text-muted)', fontSize:'var(--text-xs)' }}>Search by Tavily</span>
             </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-grid > div { margin: 0 auto; }
          .hero-feed { order: 2; width: 100% !important; max-width: 400px; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .cat-grid { grid-template-columns: repeat(3,1fr) !important; }
          .recent-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .cat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </main>
  );
}
