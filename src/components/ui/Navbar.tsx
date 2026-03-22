"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'Explore' },
  { href: '/upload', label: 'Verify' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/sources', label: 'Sources' },
  { href: '/about', label: 'Why Us' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--bg-overlay)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 32 }}>
        
        {/* Logo */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap: 12, textDecoration:'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
            <Shield size={20} color="#A78BFA" strokeWidth={2} />
          </div>
          <div className="mobile-logotext" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#e8e1fbff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              VerifyLens
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginTop: 4 }}>
              VERIFY BEFORE YOU TRUST
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display:'flex', gap:4, flex:1, justifyContent:'center' }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              textDecoration: 'none',
              color: pathname === link.href ? 'var(--cyan)' : 'var(--text-secondary)',
              background: pathname === link.href ? 'var(--cyan-dim)' : 'transparent',
              transition: 'all 200ms'
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <Link href="/upload" className="hover-lift btn-glow" style={{
            padding: '8px 20px', borderRadius: 'var(--radius-full)',
            background: 'var(--text-primary)', color: 'var(--bg-base)',
            fontWeight: 800, fontSize: 'var(--text-sm)',
            textDecoration: 'none', fontFamily: 'Syne, sans-serif'
          }}>
            Verify Now
          </Link>
          <button onClick={() => setOpen(!open)} style={{ display:'none', background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer' }} className="mobile-menu-btn">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', background: 'var(--bg-surface)', display:'flex', flexDirection:'column', gap:4 }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              color: pathname === link.href ? 'var(--cyan)' : 'var(--text-secondary)',
              background: pathname === link.href ? 'var(--cyan-dim)' : 'transparent',
              fontWeight: 500, textDecoration: 'none', fontSize: 'var(--text-md)'
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 480px) {
          .mobile-logotext { display: none !important; }
          .btn-glow { padding: 6px 14px !important; font-size: 12px !important; }
        }
      `}</style>
    </header>
  );
}
