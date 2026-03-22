"use client";
import { useState } from 'react';
import { Card } from './primitives';

type ImageEvidencePanelProps = {
  articleIndex: number;
  title: string;
  category: string;
  sourceName: string;
};

const TABS = [
  'Related news',
  'Fact evidence',
  'Image search',
  'Source screenshot'
];

export function ImageEvidencePanel({ articleIndex, title, category, sourceName }: ImageEvidencePanelProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Computed layout based on rule: articleIndex * 20 + layerIndex * 4 + imageIndex
  const getImageUrl = (imageIndex: number) => {
    const sig = articleIndex * 20 + activeTab * 4 + imageIndex;
    return `https://source.unsplash.com/random/400x300?sig=${sig}&${category.toLowerCase()}`;
  };

  return (
    <Card style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-surface)' }}>
      {/* Header Info */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em', marginBottom: '4px' }}>EVIDENCE PANEL</p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>{title}</p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>Source: {sourceName}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '16px', overflowX: 'auto' }}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab(idx); }}
            style={{
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === idx ? '2px solid var(--cyan)' : '2px solid transparent',
              color: activeTab === idx ? 'var(--cyan)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'Syne, sans-serif',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              transition: 'all 200ms'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[0, 1, 2].map(imgIdx => (
          <div key={`${activeTab}-${imgIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: 'var(--bg-elevated)',
              position: 'relative'
            }}>
              {/* Fallback to unsplash source using standard img tag */}
              <img
                src={getImageUrl(imgIdx)}
                alt={`${TABS[activeTab]} evidence ${imgIdx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.4, textAlign: 'center' }}>
              {TABS[activeTab]} ref #{articleIndex * 20 + activeTab * 4 + imgIdx}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
