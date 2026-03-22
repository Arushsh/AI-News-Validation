"use client";
import { Card } from '@/components/ui/primitives';
import { TrendingUp, TrendingDown, FileCheck, AlertTriangle, XCircle, Cpu, BarChart2 } from 'lucide-react';

import { useState, useEffect } from 'react';
// SVG Line Chart for Fake News Trends
function LineChart({ data = [42, 58, 51, 71, 64, 89, 74, 95, 81, 103, 91, 118] }: { data?: number[] }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const h = 160, w = 640, pad = 20;
  const maxD = Math.max(...data, 1);
  const pts = data.map((d,i) => ({ x: pad + i*(w-pad*2)/(data.length-1 || 1), y: h - pad - (d/maxD)*(h-pad*2) }));
  const pathD = pts.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length-1].x},${h-pad} L${pts[0].x},${h-pad} Z`;
  return (
    <div style={{ overflowX:'auto' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', minWidth:320 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0.25,0.5,0.75,1].map(f => (
          <line key={f} x1={pad} y1={pad + (1-f)*(h-pad*2)} x2={w-pad} y2={pad + (1-f)*(h-pad*2)} stroke="var(--border)" strokeWidth="1" />
        ))}
        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--cyan)" />)}
        {months.map((m,i) => <text key={m} x={pts[i].x} y={h} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontFamily="DM Sans, sans-serif">{m}</text>)}
      </svg>
    </div>
  );
}

// Donut Chart for Category Breakdown
function DonutChart({ data }: { data?: {label:string, value:number}[] }) {
  const defaultCats = [
    { label:'Politics', value:32, color:'#6366f1' },
    { label:'Technology', value:24, color:'#06b6d4' },
    { label:'Health', value:18, color:'#84cc16' },
    { label:'Business', value:14, color:'#10b981' },
    { label:'Other', value:12, color:'#8892AA' },
  ];
  const colors = ['#6366f1', '#06b6d4', '#84cc16', '#10b981', '#ec4899', '#f59e0b', '#8892AA'];
  const cats = data ? data.map((d, i) => ({ ...d, color: colors[i % colors.length] })) : defaultCats;
  const totalValue = cats.reduce((acc, c) => acc + c.value, 0);
  const cx=80, cy=80, r=60, iR=38;
  let angle = -90;
  const slices = cats.map(c => {
    const sweep = totalValue === 0 ? 0 : (c.value / totalValue) * 360;
    const start = angle; angle += sweep;
    const rad1 = start*Math.PI/180, rad2 = (start+sweep)*Math.PI/180;
    const x1=cx+r*Math.cos(rad1), y1=cy+r*Math.sin(rad1);
    const x2=cx+r*Math.cos(rad2), y2=cy+r*Math.sin(rad2);
    const xi1=cx+iR*Math.cos(rad1), yi1=cy+iR*Math.sin(rad1);
    const xi2=cx+iR*Math.cos(rad2), yi2=cy+iR*Math.sin(rad2);
    const large = sweep > 180 ? 1 : 0;
    const dAttr = sweep === 360 ? 
      `M${cx+r},${cy} A${r},${r},0,1,1,${cx+r},${cy-0.01} L${cx+iR},${cy-0.01} A${iR},${iR},0,1,0,${cx+iR},${cy} Z` :
      `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${xi2},${yi2} A${iR},${iR},0,${large},0,${xi1},${yi1} Z`;
    return { ...c, d: dAttr };
  });

  return (
    <div style={{ display:'flex', gap:24, alignItems:'center', flexWrap:'wrap' }}>
      <svg viewBox="0 0 160 160" style={{ width:160, flexShrink:0 }}>
        {slices.map(s => <path key={s.label} d={s.d} fill={s.color} opacity="0.9" />)}
        <text x={cx} y={cy-4} textAnchor="middle" fontSize="20" fill="var(--text-primary)" fontFamily="Syne" fontWeight="900">100%</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="DM Sans">Coverage</text>
      </svg>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        {cats.map(c => (
          <div key={c.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:10, height:10, borderRadius:2, background:c.color, flexShrink:0 }} />
            <span style={{ flex:1, fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{c.label}</span>
            <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'var(--text-xs)', color:'var(--text-primary)', fontWeight:700 }}>{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Heatmap Calendar (12x7 grid mapped to actual data)
function Heatmap() {
  const [weeks, setWeeks] = useState<number[][]>([]);
  useEffect(() => {
    fetch('/api/analytics/heatmap')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Group raw data into 52 weeks x 7 days
          const grid = Array.from({length:52}, () => Array.from({length:7}, () => 0));
          const now = new Date();
          data.forEach((r: any) => {
             const d = new Date(r.createdAt);
             const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
             if (diff >= 0 && diff < 364) {
                const weekIdx = 51 - Math.floor(diff / 7);
                const dayIdx = diff % 7;
                grid[weekIdx][dayIdx] = Math.min(grid[weekIdx][dayIdx] + 1, 4);
             }
          });
          setWeeks(grid);
        } else {
          // Fallback empty grid
          setWeeks(Array.from({length:52}, () => Array.from({length:7}, () => 0)));
        }
      })
      .catch(() => setWeeks(Array.from({length:52}, () => Array.from({length:7}, () => 0))));
  }, []);

  const colors = ['#1A1F28','#004d40','#00897b','#00bfa5','#00D4FF'];
  
  if (weeks.length === 0) {
    return <div style={{ height:96, width:'100%', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', opacity:0.3 }} />;
  }

  return (
    <div style={{ overflowX:'auto' }}>
      <div style={{ display:'flex', gap:2 }}>
        {weeks.map((week,wi) => (
          <div key={wi} style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {week.map((val,di) => (
              <div key={di} title={`${val} verifications`} style={{ width:12, height:12, borderRadius:2, background:colors[val], transition:'transform 150ms', cursor:'pointer' }}
                onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.4)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Top Fake Sources Bar Chart
function FakeSourcesBar() {
  const [sources, setSources] = useState<{name:string, count:number}[]>([]);
  useEffect(() => {
    fetch('/api/analytics/sources')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSources(data); });
  }, []);

  if (sources.length === 0) return <div style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No activity data.</div>;

  const max = Math.max(...sources.map(s => s.count), 1);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {sources.map((s,i) => (
        <div key={s.name} style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontFamily:'JetBrains Mono, monospace', fontSize:'var(--text-xs)', color:'var(--text-muted)', minWidth:16 }}>#{i+1}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{s.name}</span>
              <span className="font-mono" style={{ fontSize:'var(--text-xs)', color:'var(--fake)' }}>{s.count}</span>
            </div>
            <div style={{ height:6, borderRadius:'var(--radius-full)', background:'var(--bg-elevated)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(s.count/max)*100}%`, background:'var(--fake)', borderRadius:'var(--radius-full)', transition:'width 1s ease' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ totalVerified: 0, fakeCaught: 0, avgAuthenticity: 0, activeModels: 12 });
  const [detailed, setDetailed] = useState<{trends?: number[], breakdown?: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = async () => {
      try {
        const [ov, det] = await Promise.all([
          fetch('/api/analytics/overview').then(r => r.json()),
          fetch('/api/analytics/detailed').then(r => r.json())
        ]);
        if (!ov.error) setStats({ ...ov, activeModels: ov.activeModels || 12 });
        if (!det.error) setDetailed(det);
      } catch (e) {
        console.error("Analytics fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatNum = (num: number) => mounted ? num.toLocaleString() : num.toString();

  const KPI = [
    { label: 'Articles Verified', value: formatNum(stats.totalVerified), change: 'Live', up: true, icon: FileCheck },
    { label: 'Fake News Caught', value: formatNum(stats.fakeCaught), change: 'Live', up: false, icon: XCircle },
    { label: 'Avg Authenticity', value: stats.avgAuthenticity.toFixed(1) + '%', change: 'Live', up: true, icon: AlertTriangle },
    { label: 'AI Models Active', value: stats.activeModels.toString(), change: 'Live', up: true, icon: Cpu },
  ];

  return (
    <main style={{ maxWidth:1280, margin:'0 auto', padding:'48px 24px' }}>
      <div style={{ marginBottom:36 }}>
        <h1 className="font-syne" style={{ fontSize:'var(--text-4xl)', fontWeight:900, marginBottom:8 }}>Analytics Dashboard</h1>
        <p style={{ color:'var(--text-secondary)' }}>Real-time intelligence on misinformation trends, source credibility patterns, and verification activity.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }} className="kpi-grid">
        {KPI.map(k => (
          <Card key={k.label}>
             {loading ? (
                <div style={{ padding:'8px 0' }}>
                  <div className="skeleton" style={{ width:80, height:14, marginBottom:16 }} />
                  <div className="skeleton" style={{ width:'60%', height:32, marginBottom:12 }} />
                  <div className="skeleton" style={{ width:'40%', height:12 }} />
                </div>
             ) : (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                    <span style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{k.label}</span>
                    <div style={{ width:36, height:36, borderRadius:'var(--radius-md)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <k.icon size={18} color="var(--cyan)" />
                    </div>
                  </div>
                  <div className="font-syne" style={{ fontSize:'var(--text-3xl)', fontWeight:900, letterSpacing:'-0.02em', marginBottom:8 }}>{k.value}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    {k.up ? <TrendingUp size={13} color="var(--verified)" /> : <TrendingDown size={13} color="var(--fake)" />}
                    <span style={{ fontSize:'var(--text-xs)', color: k.up ? 'var(--verified)' : 'var(--fake)', fontWeight:600 }}>{k.change} vs last month</span>
                  </div>
                </>
             )}
          </Card>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }} className="chart-row-1">
        <Card style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.5s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 className="font-syne" style={{ fontWeight:700 }}>Fake News Trend (2026)</h3>
            <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', fontFamily:'JetBrains Mono, monospace' }}>Fake articles / month</span>
          </div>
          <LineChart data={detailed?.trends} />
        </Card>
        <Card style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.5s' }}>
          <h3 className="font-syne" style={{ fontWeight:700, marginBottom:20 }}>Category Breakdown</h3>
          <DonutChart data={detailed?.breakdown} />
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="chart-row-2">
        <Card>
          <h3 className="font-syne" style={{ fontWeight:700, marginBottom:16 }}>Verification Activity (52 weeks)</h3>
          <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', marginBottom:16 }}>Each cell = 1 day. Darker = more verifications.</p>
          <Heatmap />
        </Card>
        <Card>
          <h3 className="font-syne" style={{ fontWeight:700, marginBottom:20 }}>Top Fake News Sources</h3>
          <FakeSourcesBar />
        </Card>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
          .chart-row-1, .chart-row-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
