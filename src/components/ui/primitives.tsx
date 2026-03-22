"use client";
import React, { useState, useEffect } from 'react';
// Re-export all shared UI primitives
export function StatusBadge({ score }: { score: number }) {
  const isVerified  = score >= 75;
  const isSuspicious = score >= 45 && score < 75;
  const bg    = isVerified ? 'var(--verified-bg)'   : isSuspicious ? 'var(--suspicious-bg)'  : 'var(--fake-bg)';
  const color = isVerified ? 'var(--verified)'      : isSuspicious ? 'var(--suspicious)'     : 'var(--fake)';
  const border = `1px solid ${color}44`;
  const label = isVerified ? 'VERIFIED' : isSuspicious ? 'SUSPICIOUS' : 'FAKE';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px',
      borderRadius:'var(--radius-full)', background:bg, color, border,
      fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:'var(--text-xs)',
      letterSpacing:'0.08em', animation: 'pulseBadge 2s ease infinite'
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:color }} />
      {label}
    </span>
  );
}

export function PrimaryButton({ children, onClick, type = 'button', disabled = false, style = {} }: any) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="btn-glow" style={{
      padding:'10px 24px', borderRadius:'var(--radius-full)', background:'var(--cyan)',
      color:'#0A0C0F', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:'var(--text-sm)',
      border:'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition:'all 150ms', ...style
    }}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, style = {} }: any) {
  return (
    <button onClick={onClick} style={{
      padding:'10px 24px', borderRadius:'var(--radius-full)',
      background:'transparent', color:'var(--text-primary)',
      fontFamily:'Syne, sans-serif', fontWeight:600, fontSize:'var(--text-sm)',
      border:'1px solid var(--border)', cursor:'pointer', transition:'all 150ms', ...style
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--cyan)')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      {children}
    </button>
  );
}

export function Card({ children, style = {} }: any) {
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:'var(--radius-lg)', padding:24, transition:'border-color 150ms', ...style
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      {children}
    </div>
  );
}

export function VeriInput({ placeholder, value, onChange, type = 'text', style = {} }: any) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={{
      width:'100%', padding:'12px 16px', borderRadius:'var(--radius-md)',
      background:'var(--bg-input)', border:'1px solid var(--border)',
      color:'var(--text-primary)', fontFamily:'DM Sans, sans-serif', fontSize:'var(--text-md)',
      outline:'none', transition:'border-color 150ms', ...style
    }}
    onFocus={e => (e.target.style.borderColor = 'var(--cyan)')}
    onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
  );
}

export function BiasBar({ value, label }: { value: number; label: string }) {
  const color = value > 66 ? 'var(--fake)' : value > 33 ? 'var(--suspicious)' : 'var(--verified)';
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>{label}</span>
        <span className="font-mono" style={{ fontSize:'var(--text-sm)', color }}>{value}%</span>
      </div>
      <div style={{ height:6, borderRadius:'var(--radius-full)', background:'var(--bg-elevated)', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${value}%`, background:color, borderRadius:'var(--radius-full)', transition:'width 1.2s ease' }} />
      </div>
    </div>
  );
}

import { ImageEvidencePanel } from './ImageEvidencePanel';

export function NewsCard({ title, category, score, timestamp, domain, imageColor, index = 0 }: any) {
  const colors: Record<string, string> = {
    Politics:'#6366f1', Tech:'#06b6d4', Sports:'#f59e0b', Entertainment:'#ec4899', Business:'#10b981', Health:'#84cc16'
  };
  const catColor = colors[category] || 'var(--cyan)';
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border)', overflow:'hidden', transition:'all 150ms', cursor:'pointer' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ height:140, background: imageColor || 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))', position:'relative' }}>
        <span style={{ position:'absolute', top:12, right:12, padding:'3px 8px', borderRadius:'var(--radius-full)', background: `${catColor}22`, color:catColor, fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:'var(--text-xs)' }}>{category}</span>
      </div>
      <div style={{ padding:'16px 16px 20px' }}>
        <p style={{ fontWeight:600, fontSize:'var(--text-md)', lineHeight:1.4, marginBottom:12, color:'var(--text-primary)' }}>{title}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{domain} · {timestamp}</span>
          <StatusBadge score={score} />
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '0 16px 16px' }}>
          <ImageEvidencePanel articleIndex={index} title={title} category={category} sourceName={domain} />
        </div>
      )}
    </div>
  );
}

export function SourceRow({ name, domain, credibility, articles, category }: any) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const color = credibility >= 75 ? 'var(--verified)' : credibility >= 45 ? 'var(--suspicious)' : 'var(--fake)';
  return (
    <tr style={{ borderBottom:'1px solid var(--border)', transition:'background 150ms' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <td style={{ padding:'14px 16px', fontWeight:600 }}>{name}</td>
      <td style={{ padding:'14px 16px', color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{domain}</td>
      <td style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ flex:1, height:6, borderRadius:'var(--radius-full)', background:'var(--bg-elevated)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${credibility}%`, background:color, borderRadius:'var(--radius-full)' }} />
          </div>
          <span className="font-mono" style={{ fontSize:'var(--text-xs)', color, minWidth:30 }}>{credibility}%</span>
        </div>
      </td>
      <td style={{ padding:'14px 16px', color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{category}</td>
      <td style={{ padding:'14px 16px', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>{mounted ? articles?.toLocaleString() : articles}</td>
    </tr>
  );
}
