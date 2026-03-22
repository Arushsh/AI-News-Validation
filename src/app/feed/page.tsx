"use client";
import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Globe, MapPin, Flag, Loader2, RefreshCw, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';

const ALL_CATS = ['All', 'Politics', 'Sports', 'Technology', 'Business', 'Entertainment', 'Health', 'World', 'Science'];
const SECTIONS = [
  { id: 'all', label: '📰 All News', color: 'var(--cyan)' },
  { id: 'trending', label: '🔥 Trending', color: '#f97316' },
  { id: 'viral', label: '⚡ Viral', color: 'var(--suspicious)' },
  { id: 'fake', label: '🚫 Fake Busted', color: 'var(--fake)' },
];
const SCALES = [
  { id: 'all', label: '🌐 All', icon: Globe },
  { id: 'international', label: '🌍 Global', icon: Globe },
  { id: 'national', label: '🇮🇳 National', icon: Flag },
  { id: 'local', label: '📍 Local', icon: MapPin },
];

const TRUSTED_SOURCES = ['Hindustan Times', 'Times of India', 'NDTV', 'The Hindu', 'Reuters', 'BBC', 'AP News', 'Global Times', 'Al Jazeera', 'CNN', 'ESPN', 'Cricbuzz', 'TechCrunch', 'The Verge', 'Wired', 'UN News', 'Global News'];
const CATEGORY_COLORS: Record<string, string> = {
  Politics: '#3b82f6', Sports: '#22c55e', Technology: '#8b5cf6',
  Business: '#f59e0b', Entertainment: '#ec4899', Health: '#14b8a6',
  World: '#6366f1', Science: '#06b6d4', General: 'var(--cyan)',
};

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return then.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function NewsCard({ article, index }: { article: any; index: number }) {
  const catColor = CATEGORY_COLORS[article.category] || 'var(--cyan)';
  const isTrusted = TRUSTED_SOURCES.some(s => article.sourceName?.includes(s));

  // Premium Fallback Images based on Category and Index
  const FALLBACKS: Record<string, string[]> = {
    Politics: ['1529107388918-87efd0856b3e', '1450101496223-ee17afee817f', '1541872703-74c5e44383f5'],
    Sports: ['1504450758481-7338eba7524a', '1517649763962-0c3175c701c3', '1461896756999-74b7acc6aa88'],
    Technology: ['1485827404703-89b55fcc595e', '1518770660439-4636190af475', '1550751827-4bd374c3f58b'],
    Business: ['1611974714851-eb605161aca8', '1460925895917-afdab827c52f', '1591696208102-09d97a45e54d'],
    World: ['1447069387593-a5de0862481e', '1526374976048-40b135c651c6', '1529107388918-87efd0856b3e'],
    Health: ['1505751172107-557c0007b8fa', '1532938911079-1b06ac7ceec7', '1506126613408-eca07ce68773'],
    Entertainment: ['1522869635100-9f4c5e86aa37', '1499364639500-115514abd6af', '1470225620780-aba8ba36b5bd'],
    Science: ['1507413245164-6160d8298b31', '1451187580459-43490279c0fa', '1532094349884-543bc11b234d'],
    General: ['1504711434969-e33886168f5c', '1486406146926-c627a92ad1ab', '1501503069356-3c6b82a17d89']
  };

  const catList = FALLBACKS[article.category] || FALLBACKS.General;
  const imgId = catList[index % catList.length];
  const displayImage = article.imageUrl || `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&q=80&w=800`;

  return (
    <a
      href={article.sourceUrl?.startsWith('http') ? article.sourceUrl : `https://${article.sourceUrl}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', flexDirection: 'column', textDecoration: 'none',
        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', overflow: 'hidden',
        transition: 'all 250ms', animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
      }}
      className="news-card-link"
    >
      {/* Image */}
      <div style={{ height: 180, background: `linear-gradient(135deg, ${catColor}22, var(--bg-elevated))`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <img 
          src={displayImage} 
          alt={article.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
          className="card-image"
          onError={(e: any) => { 
            e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'; 
          }} 
        />
        {/* Category badge */}
        <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: catColor, color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em' }}>
          {article.category}
        </span>
        {/* Scale badge */}
        <span style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.7)', color: 'var(--text-secondary)', fontSize: '9px', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
          {article.scale === 'national' ? '🇮🇳 National' : article.scale === 'local' ? '📍 Local' : '🌍 Global'}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {article.title}
        </h3>
        {article.description && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: isTrusted ? 'var(--cyan)' : 'var(--text-muted)' }}>{article.sourceName}</span>
            {isTrusted && <ShieldCheck size={11} color="var(--cyan)" />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '10px' }}>
            <Calendar size={10} />
            {article.publishedAt ? timeAgo(article.publishedAt) : 'Just now'}
          </div>
        </div>
      </div>
    </a>
  );
}

export default function FeedPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [activeScale, setActiveScale] = useState('all');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [fromCache, setFromCache] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      // Use search API if query exists
      if (debouncedSearch) {
        const res = await fetch(`/api/news/search?q=${encodeURIComponent(debouncedSearch)}&category=${activeCat}&scale=${activeScale}&limit=20`);
        const data = await res.json();
        setArticles(data.articles || []);
        setTotal(data.articles?.length || 0);
        setFromCache(false);
      } else {
        const res = await fetch(`/api/news?category=${activeCat}&scale=${activeScale}&limit=24`);
        const data = await res.json();
        setArticles(data.articles || []);
        setTotal(data.total || 0);
        setFromCache(data.fromCache || false);
      }
    } catch {
      setArticles([]);
    }
    setLoading(false);
    setLastRefresh(new Date());
  }, [activeCat, activeScale, debouncedSearch]);
  // Initial fetch and 60-second auto-refresh
  useEffect(() => { 
    fetchNews(); 
    const interval = setInterval(fetchNews, 60000); 
    return () => clearInterval(interval);
  }, [fetchNews]);

  const handleSync = async () => {
    setLoading(true);
    try {
      await fetch('/api/news/sync', { method: 'POST' });
      await fetchNews();
    } catch (e) {
      console.error('Sync failed:', e);
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="font-syne" style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              Live News Feed
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
              {fromCache ? '🟡 Showing cached articles — N8N sync pending' : `🟢 ${total} articles from trusted sources`}
              &nbsp;·&nbsp;Updated {timeAgo(lastRefresh.toISOString())}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={handleSync} 
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1px solid var(--cyan)', borderRadius: 'var(--radius-md)', background: 'var(--cyan-dim)', color: 'var(--cyan)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 700, transition: 'all 200ms', opacity: loading ? 0.6 : 1 }}
            >
              <Globe size={14} className={loading ? 'animate-spin' : ''} /> Sync Trending
            </button>
            <button onClick={fetchNews} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600, transition: 'all 200ms' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Scale Pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {SCALES.map(s => (
            <button key={s.id} onClick={() => setActiveScale(s.id)} style={{ padding: '7px 16px', borderRadius: 'var(--radius-full)', border: `1px solid ${activeScale === s.id ? 'var(--cyan)' : 'var(--border)'}`, background: activeScale === s.id ? 'var(--cyan-dim)' : 'var(--bg-card)', color: activeScale === s.id ? 'var(--cyan)' : 'var(--text-muted)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 200ms' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }} className="feed-layout">
        {/* Sidebar */}
        <aside style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 18, position: 'sticky', top: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <SlidersHorizontal size={14} color="var(--cyan)" />
            <span className="font-syne" style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Categories</span>
          </div>
          {ALL_CATS.map(cat => {
            const color = CATEGORY_COLORS[cat] || 'var(--cyan)';
            return (
              <button key={cat} onClick={() => setActiveCat(cat)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '9px 12px', borderRadius: 'var(--radius-md)', marginBottom: 2, border: 'none', background: activeCat === cat ? `${color}22` : 'transparent', color: activeCat === cat ? color : 'var(--text-secondary)', fontSize: 'var(--text-sm)', cursor: 'pointer', fontWeight: activeCat === cat ? 700 : 400, transition: 'all 150ms' }}>
                {activeCat === cat && <span style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0 }} />}
                {cat}
              </button>
            );
          })}

          <div style={{ marginTop: 24, padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p className="font-syne" style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 8 }}>TRUSTED SOURCES</p>
            {TRUSTED_SOURCES.slice(0, 5).map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <ShieldCheck size={10} color="var(--cyan)" />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Search news, topics, sources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
              <p style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: 'var(--text-md)' }}>No articles yet</p>
              <p style={{ fontSize: 'var(--text-sm)', marginTop: 8 }}>Connect your N8N workflow to start fetching live news from Hindustan Times and Times of India.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {articles.map((a, i) => <NewsCard key={a.id || a.sourceUrl} article={a} index={i} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .news-card-link:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); border-color: var(--cyan) !important; }
        @media (max-width: 1024px) { .feed-layout { grid-template-columns: 1fr !important; } aside { position: static !important; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
