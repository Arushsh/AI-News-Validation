// src/components/ui/ScoreGauge.tsx
"use client";
import { useEffect, useState } from 'react';

interface Props {
  score: number; // 0–100
  size?: number;
  color?: string;
}

export function ScoreGauge({ score, size = 180, color }: Props) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use 75% of the circle (270°) as the arc
  const arcLength = circumference * 0.75;
  const offset = arcLength - (animated / 100) * arcLength;

  const gaugeColor = color ?? (
    score >= 75 ? '#34d399' :   // emerald
    score >= 45 ? '#fbbf24' :   // amber
    '#f87171'                    // red
  );

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#262626"
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Animated Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gaugeColor}
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 8px ${gaugeColor}80)` }}
        />
      </svg>
      {/* Centered Score Text */}
      <div className="absolute flex flex-col items-center" style={{ marginTop: -4 }}>
        <span className="text-4xl font-black" style={{ color: gaugeColor }}>{score}</span>
        <span className="text-xs text-neutral-500 font-bold uppercase tracking-widest">/ 100</span>
      </div>
    </div>
  );
}
