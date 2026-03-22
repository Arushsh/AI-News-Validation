"use client";
import { useState } from 'react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Card, BiasBar, StatusBadge } from '@/components/ui/primitives';
import { MessageSquare, ThumbsUp, ThumbsDown, Users, ExternalLink } from 'lucide-react';

const MOCK = {
  title: 'India wins ICC Men\'s T20 World Cup 2026 in thrilling final over Australia',
  score: 91,
  category: 'Sports',
  domain: 'espncricinfo.com',
  timestamp: '2026-03-19T01:00:00Z',
  explanation: 'Multiple high-credibility sports news outlets including ESPNCricinfo, BBC Sport, and Sky Sports have confirmed this event through live match reporting. Official ICC social media channels concur. No contradicting sources found.',
  ai_generated_probability: 4,
  sources: [
    { name: 'ESPNCricinfo', credibility: 94, url: 'https://espncricinfo.com', stance: 'supporting' },
    { name: 'BBC Sport', credibility: 97, url: 'https://bbc.co.uk/sport', stance: 'supporting' },
    { name: 'Sky Sports', credibility: 89, url: 'https://skysports.com', stance: 'supporting' },
    { name: 'Cricbuzz', credibility: 82, url: 'https://cricbuzz.com', stance: 'neutral' },
  ],
  bias: { 'Political Bias': 3, 'Emotional Language': 12, 'Sensationalism': 18, 'AI-Generated Likelihood': 4 },
  votes: { yes: 142, no: 8 },
  comments: [
    { user: 'NewsNerd99', time: '2h ago', text: 'Watched the match live — 100% authentic. Great win!' },
    { user: 'FactFirst', time: '3h ago', text: 'Cross-checked with 3 sources. All confirm the result.' },
  ]
};

const TABS = ['AI Analysis', 'Sources', 'Community'];

export default function ReportPage() {
  const [tab, setTab] = useState('AI Analysis');
  const [voted, setVoted] = useState<null | 'yes' | 'no'>(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(MOCK.comments);

  return (
    <main style={{ maxWidth:1200, margin:'0 auto', padding:'48px 24px' }}>
      {/* Hero Score */}
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <StatusBadge score={MOCK.score} />
        <h1 className="font-syne" style={{ fontSize:'clamp(1.5rem,3vw,2.25rem)', fontWeight:800, margin:'16px auto', maxWidth:700 }}>{MOCK.title}</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginBottom:32 }}>{MOCK.domain} · {new Date(MOCK.timestamp).toLocaleDateString()}</p>
        <div style={{ display:'flex', justifyContent:'center' }}>
          <ScoreRing score={MOCK.score} size={240} />
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }} className="report-layout">
        {/* Left: Tabs */}
        <div>
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:24 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding:'12px 20px', background:'none', border:'none', borderBottom:`2px solid ${t===tab?'var(--cyan)':'transparent'}`, color: t===tab?'var(--cyan)':'var(--text-secondary)', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:'var(--text-sm)', cursor:'pointer', transition:'all 200ms' }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'AI Analysis' && (
            <Card>
              <h3 className="font-syne" style={{ fontWeight:700, marginBottom:20 }}>Bias & Manipulation Detection</h3>
              {Object.entries(MOCK.bias).map(([k,v]) => <BiasBar key={k} label={k} value={v as number} />)}
              <div style={{ marginTop:24, padding:16, borderRadius:'var(--radius-md)', background:'var(--bg-input)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', lineHeight:1.7 }}>{MOCK.explanation}</p>
              </div>
            </Card>
          )}

          {tab === 'Sources' && (
            <Card>
              <h3 className="font-syne" style={{ fontWeight:700, marginBottom:20 }}>Source Cross-Reference</h3>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['Source','Credibility','Stance','Link'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:'var(--text-xs)', color:'var(--text-muted)', fontFamily:'Syne, sans-serif', fontWeight:700, letterSpacing:'0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK.sources.map(s => (
                    <tr key={s.name} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'12px', fontWeight:600, fontSize:'var(--text-sm)' }}>{s.name}</td>
                      <td style={{ padding:'12px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:60, height:6, borderRadius:'var(--radius-full)', background:'var(--bg-elevated)' }}>
                            <div style={{ width:`${s.credibility}%`, height:'100%', background: s.credibility>=75?'var(--verified)':'var(--suspicious)', borderRadius:'var(--radius-full)' }} />
                          </div>
                          <span className="font-mono" style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)' }}>{s.credibility}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:'var(--radius-full)', background: s.stance==='supporting'?'var(--verified-bg)':'var(--bg-elevated)', color: s.stance==='supporting'?'var(--verified)':'var(--text-secondary)', fontSize:'var(--text-xs)', fontFamily:'Syne, sans-serif', fontWeight:700 }}>{s.stance}</span>
                      </td>
                      <td style={{ padding:'12px' }}>
                        <a href={s.url} target="_blank" rel="noreferrer" style={{ color:'var(--cyan)', display:'flex', alignItems:'center', gap:4 }}><ExternalLink size={13} /></a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {tab === 'Community' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {comments.map((c, i) => (
                <Card key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontWeight:700, fontSize:'var(--text-sm)' }}>{c.user}</span>
                    <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{c.time}</span>
                  </div>
                  <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{c.text}</p>
                </Card>
              ))}
              <div style={{ display:'flex', gap:8 }}>
                <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment…" style={{ flex:1, padding:'10px 14px', borderRadius:'var(--radius-md)', background:'var(--bg-input)', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:'var(--text-sm)', outline:'none' }} onFocus={e=>(e.target.style.borderColor='var(--cyan)')} onBlur={e=>(e.target.style.borderColor='var(--border)')} />
                <button onClick={() => { if(comment.trim()) { setComments([...comments, {user:'You', time:'Just now', text:comment}]); setComment(''); } }} style={{ padding:'10px 20px', borderRadius:'var(--radius-md)', background:'var(--cyan)', color:'#0A0C0F', fontFamily:'Syne, sans-serif', fontWeight:700, border:'none', cursor:'pointer' }}>Post</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Score Summary + Vote */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <p className="font-syne" style={{ fontSize:'var(--text-xs)', letterSpacing:'0.1em', color:'var(--text-muted)', marginBottom:12 }}>QUICK STATS</p>
            {[['Authenticity', MOCK.score + '%'], ['AI-Generated', MOCK.ai_generated_probability + '%'], ['Sources Checked', MOCK.sources.length], ['Category', MOCK.category]].map(([k,v]) => (
              <div key={k as string} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{k}</span>
                <span className="font-mono" style={{ fontSize:'var(--text-sm)', fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Users size={16} color="var(--cyan)" />
              <p className="font-syne" style={{ fontWeight:700, fontSize:'var(--text-sm)' }}>Community Vote</p>
            </div>
            <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', marginBottom:16 }}>Is this story accurate?</p>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setVoted('yes')} style={{ flex:1, padding:'10px', borderRadius:'var(--radius-md)', border:`2px solid ${voted==='yes'?'var(--verified)':'var(--border)'}`, background:voted==='yes'?'var(--verified-bg)':'var(--bg-input)', color:voted==='yes'?'var(--verified)':'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer', fontWeight:600, transition:'all 200ms' }}>
                <ThumbsUp size={15} /> {MOCK.votes.yes + (voted==='yes'?1:0)}
              </button>
              <button onClick={() => setVoted('no')} style={{ flex:1, padding:'10px', borderRadius:'var(--radius-md)', border:`2px solid ${voted==='no'?'var(--fake)':'var(--border)'}`, background:voted==='no'?'var(--fake-bg)':'var(--bg-input)', color:voted==='no'?'var(--fake)':'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer', fontWeight:600, transition:'all 200ms' }}>
                <ThumbsDown size={15} /> {MOCK.votes.no + (voted==='no'?1:0)}
              </button>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) { .report-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}
