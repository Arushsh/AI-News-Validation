"use client";
import { MessageSquare, Send } from 'lucide-react';
import { Card, PrimaryButton } from '@/components/ui/primitives';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Small delay to simulate processing and make it feel premium
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:'var(--radius-full)', background:'var(--cyan-dim)', border:'1px solid var(--border-active)', marginBottom:24 }}>
          <MessageSquare size={14} color="var(--cyan)" />
          <span style={{ fontSize:'var(--text-xs)', color:'var(--cyan)', fontFamily:'Syne, sans-serif', fontWeight:700, letterSpacing:'0.1em' }}>GET IN TOUCH</span>
        </div>
        <h1 className="font-syne" style={{ fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--text-primary)' }}>
          Contact <span className="text-gradient">VerifyLens</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', maxWidth: 600, margin: '0 auto' }}>
          Have a question about our verification engine, API access, or enterprise solutions? We're here to help.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Contact Form */}
        <Card style={{ padding: 'min(60px, 8vw)', background: 'var(--bg-surface)' }}>
          <h2 className="font-syne" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 32 }}>Send us a Message</h2>
          
          {sent ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--verified)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--verified-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Send size={32} color="var(--verified)" />
              </div>
              <h3 className="font-syne" style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Message Sent Successfully!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Thank you for reaching out. Our support team will get back to you within 24 hours.</p>
              <PrimaryButton onClick={() => setSent(false)} style={{ marginTop: 24 }}>Send Another Message</PrimaryButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="form-row">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>First Name</label>
                  <input name="firstName" required type="text" placeholder="John" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 200ms' }} onFocus={e=>(e.target.style.borderColor='var(--cyan)')} onBlur={e=>(e.target.style.borderColor='var(--border)')} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name</label>
                  <input name="lastName" required type="text" placeholder="Doe" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 200ms' }} onFocus={e=>(e.target.style.borderColor='var(--cyan)')} onBlur={e=>(e.target.style.borderColor='var(--border)')} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                <input name="email" required type="email" placeholder="john@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 200ms' }} onFocus={e=>(e.target.style.borderColor='var(--cyan)')} onBlur={e=>(e.target.style.borderColor='var(--border)')} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject</label>
                <select name="subject" required style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', appearance: 'none' }}>
                  <option value="General Support">General Support</option>
                  <option value="API Access">API Access</option>
                  <option value="Enterprise Integration">Enterprise Integration</option>
                  <option value="Press & Media">Press & Media</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>Message</label>
                <textarea name="message" required rows={5} placeholder="How can we help you?" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', transition: 'border-color 200ms' }} onFocus={e=>(e.target.style.borderColor='var(--cyan)')} onBlur={e=>(e.target.style.borderColor='var(--border)')} />
              </div>

              <PrimaryButton type="submit" disabled={loading} style={{ padding: '16px', marginTop: 12, display: 'flex', justifyContent: 'center', gap: 12 }}>
                {loading ? 'Sending Message...' : (
                  <>Send Message <Send size={18} /></>
                )}
              </PrimaryButton>
            </form>
          )}

        </Card>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

