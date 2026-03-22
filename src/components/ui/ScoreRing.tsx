"use client";
import { useEffect, useState } from 'react';

interface Props {
  score: number;
  size?: number;
  animate?: boolean;
}

export function ScoreRing({ score, size = 200, animate = true }: Props) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);
  
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setDisplayed(score), 200);
    return () => clearTimeout(t);
  }, [score, animate]);

  const strokeWidth = size * 0.055;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75;
  const offset = arc - (displayed / 100) * arc;

  const color = score >= 75 ? 'var(--verified)' : score >= 45 ? 'var(--suspicious)' : 'var(--fake)';
  const label = score >= 75 ? 'VERIFIED' : score >= 45 ? 'SUSPICIOUS' : 'FAKE';
  const labelColor = score >= 75 ? 'var(--verified)' : score >= 45 ? 'var(--suspicious)' : 'var(--fake)';

  return (
    <div style={{ position: 'relative', width: size, height: size, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-135deg)', position:'absolute' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="var(--bg-elevated)" strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference}`} strokeLinecap="round" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${circumference}`}
          strokeDashoffset={offset} strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)',
            filter: `drop-shadow(0 0 10px ${color}88)`
          }} />
      </svg>
      <div style={{ textAlign:'center', zIndex:1 }}>
        <div className="font-syne" style={{ fontSize: size * 0.22, fontWeight: 900, color, lineHeight: 1 }}>{displayed}</div>
        <div style={{ fontSize: size * 0.07, color: 'var(--text-muted)', lineHeight:1 }}>/ 100</div>
        <div className="font-syne" style={{ fontSize: size * 0.08, fontWeight: 700, color: labelColor, marginTop: 4, letterSpacing:'0.05em' }}>{label}</div>
      </div>
    </div>
  );
}
