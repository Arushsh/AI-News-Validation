"use client";
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/primitives';
import { SourceRow } from '@/components/ui/primitives';
import { Search, X, ExternalLink } from 'lucide-react';

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/sources')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSources(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = sources.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.domain.includes(search.toLowerCase())
  );

  return (
    <main style={{ maxWidth:1280, margin:'0 auto', padding:'48px 24px' }}>
      <div style={{ marginBottom:36 }}>
        <h1 className="font-syne" style={{ fontSize:'var(--text-4xl)', fontWeight:900, marginBottom:8 }}>Source Tracker</h1>
        <p style={{ color:'var(--text-secondary)' }}>Credibility ratings for {sources.length} tracked news sources, updated continuously.</p>
      </div>

      {/* Search */}
      <div style={{ position:'relative', maxWidth:400, marginBottom:24 }}>
        <Search size={16} color="var(--text-muted)" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
        <input placeholder="Search sources…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'11px 16px 11px 40px', borderRadius:'var(--radius-md)', background:'var(--bg-input)', border:'1px solid var(--border)', color:'var(--text-primary)', fontFamily:'DM Sans, sans-serif', outline:'none', transition:'border-color 200ms' }}
          onFocus={e=>(e.target.style.borderColor='var(--cyan)')} onBlur={e=>(e.target.style.borderColor='var(--border)')} />
      </div>

      <div className="sources-grid" style={{ display:'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap:24, alignItems:'start' }}>
        {/* Table */}
        <Card style={{ padding:0, overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--bg-elevated)', borderBottom:'1px solid var(--border)' }}>
                {['Source','Domain','Credibility Score','Category','Articles Tracked'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'14px 16px', fontSize:'var(--text-xs)', color:'var(--text-muted)', fontFamily:'Syne, sans-serif', fontWeight:700, letterSpacing:'0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'14px 16px' }}><div className="skeleton" style={{ width:120, height:16 }} /></td>
                    <td style={{ padding:'14px 16px' }}><div className="skeleton" style={{ width:140, height:16 }} /></td>
                    <td style={{ padding:'14px 16px' }}><div className="skeleton" style={{ width:100, height:16 }} /></td>
                    <td style={{ padding:'14px 16px' }}><div className="skeleton" style={{ width:80, height:16 }} /></td>
                    <td style={{ padding:'14px 16px' }}><div className="skeleton" style={{ width:40, height:16 }} /></td>
                  </tr>
                ))
              ) : filtered.map(s => (
                <tr key={s.domain} onClick={() => setSelected(selected?.domain===s.domain?null:s)} style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background 150ms', background: selected?.domain===s.domain?'var(--bg-elevated)':'transparent' }}
                  onMouseEnter={e => { if(selected?.domain!==s.domain)(e.currentTarget as HTMLElement).style.background='var(--bg-surface)'; }}
                  onMouseLeave={e => { if(selected?.domain!==s.domain)(e.currentTarget as HTMLElement).style.background='transparent'; }}>
                  <td style={{ padding:'14px 16px', fontWeight:600, fontSize:'var(--text-sm)' }}>{s.name}</td>
                  <td style={{ padding:'14px 16px', color:'var(--text-secondary)', fontSize:'var(--text-sm)', fontFamily:'JetBrains Mono, monospace' }}>{s.domain}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, maxWidth:100, height:6, borderRadius:'var(--radius-full)', background:'var(--bg-elevated)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${s.credibility}%`, background: s.credibility>=75?'var(--verified)':s.credibility>=45?'var(--suspicious)':'var(--fake)', borderRadius:'var(--radius-full)' }} />
                      </div>
                      <span className="font-mono" style={{ fontSize:'var(--text-xs)', color: s.credibility>=75?'var(--verified)':s.credibility>=45?'var(--suspicious)':'var(--fake)', minWidth:30 }}>{s.credibility}%</span>
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px', color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{s.category}</td>
                  <td style={{ padding:'14px 16px', color:'var(--text-muted)', fontSize:'var(--text-sm)', fontFamily:'JetBrains Mono, monospace' }}>{s.articles.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Detail Drawer */}
        {selected && (
          <Card style={{ position:'sticky', top:80 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 className="font-syne" style={{ fontWeight:800, fontSize:'var(--text-lg)' }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <a href={`https://${selected.domain}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:6, color:'var(--cyan)', fontSize:'var(--text-sm)', marginBottom:20, textDecoration:'none' }}>
              <ExternalLink size={14} /> {selected.domain}
            </a>
            <div style={{ display:'flex', flexDirection:'column', gap:12, padding:'16px 0', borderTop:'1px solid var(--border)' }}>
              {[['Category', selected.category], ['Articles Tracked', selected.articles.toLocaleString()], ['Credibility', selected.credibility + '%']].map(([k,v]) => (
                <div key={k as string} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{k}</span>
                  <span className="font-mono" style={{ fontWeight:700, fontSize:'var(--text-sm)', color: k==='Credibility' ? (selected.credibility>=75?'var(--verified)':selected.credibility>=45?'var(--suspicious)':'var(--fake)') : 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ height:8, borderRadius:'var(--radius-full)', background:'var(--bg-elevated)', overflow:'hidden', marginTop:16 }}>
              <div style={{ height:'100%', width:`${selected.credibility}%`, background: selected.credibility>=75?'var(--verified)':selected.credibility>=45?'var(--suspicious)':'var(--fake)', borderRadius:'var(--radius-full)', transition:'width 1s ease' }} />
            </div>
          </Card>
        )}
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .sources-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
