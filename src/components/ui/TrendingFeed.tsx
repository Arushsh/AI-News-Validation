"use client";
import { useState, useEffect } from 'react';
import { TrendingUp, ShieldCheck, Loader2 } from 'lucide-react';
import { Card } from './primitives';

export function TrendingFeed() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending?section=trending')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data.slice(0, 5));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Card style={{ padding: 20, display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}><Loader2 className="animate-spin" color="var(--cyan)" /></Card>;

  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={16} color="var(--cyan)" />
        </div>
        <h3 className="font-syne" style={{ fontWeight: 800, fontSize: 'var(--text-md)' }}>Live Trends</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" 
             style={{ textDecoration: 'none', display: 'flex', gap: 12, paddingBottom: 16, borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border)', transition: 'transform 0.2s' }}
             className="hover-lift-sm">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.domain}</span>
                {item.scale && (
                   <span style={{ fontSize: '9px', padding: '0 4px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', textTransform: 'uppercase' }}>{item.scale}</span>
                )}
                {item.isTrusted && <ShieldCheck size={10} color="var(--cyan)" />}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{item.title}</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 900, color: item.score > 70 ? 'var(--cyan)' : 'var(--suspicious)' }}>{item.score}%</div>
            </div>
          </a>
        ))}
      </div>

      <button style={{ width: '100%', marginTop: 10, padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => window.location.href = '/feed'}>
        View Full Explore Feed
      </button>

      <style jsx>{`
        .hover-lift-sm:hover { transform: translateX(4px); }
      `}</style>
    </Card>
  );
}
