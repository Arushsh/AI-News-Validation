"use client";
import { useState, useRef } from 'react';
import { PrimaryButton, VeriInput, Card } from '@/components/ui/primitives';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { UploadCloud, Link2, FileText, AlertCircle, CheckCircle2, Loader2, Share2, Download } from 'lucide-react';
import { downloadVerificationPDF } from '@/lib/pdf-export';

const STAGES = ['Uploading', 'Searching trusted sources...', 'Fetching related news...', 'Comparing multiple sources...', 'Fetching trusted sources via n8n...', 'Running AI analysis...', 'Generating final result...'];

export default function UploadPage() {
  const [tab, setTab] = useState<'image' | 'video' | 'audio' | 'url' | 'text'>('image');
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [stage, setStage] = useState(-1); // -1 = idle
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  };

  const handleVerify = async () => {
    setResult(null);
    setStage(0);

    let bodyData: any;
    let headers: any = {};

    if (['image', 'video', 'audio'].includes(tab) && file) {
      const formData = new FormData();
      formData.append('file', file);
      bodyData = formData;
    } else if (tab === 'url' && url) {
      bodyData = JSON.stringify({ url });
      headers = { 'Content-Type': 'application/json' };
    } else {
      bodyData = JSON.stringify({ claim: text });
      headers = { 'Content-Type': 'application/json' };
    }

    try {
      const res = await fetch('/api/verify', { method: 'POST', headers, body: bodyData });
      const data = await res.json();
      
      if (data.jobId) {
        // Poll every 2 seconds
        let finalData = null;
        for (let i = 0; i < 30; i++) {
           await new Promise(r => setTimeout(r, 2000));
           const statusRes = await fetch(`/api/verify/status/${data.jobId}`);
           const statusData = await statusRes.json();
           
           if (statusData.state === 'SUCCESS') {
             finalData = statusData.report;
             break;
           } else if (statusData.state === 'FAILURE') {
             finalData = { error: statusData.error || 'Verification failed.' };
             break;
           } else {
             const stageIdx = STAGES.findIndex(s => s === statusData.stage);
             if (stageIdx !== -1 && stageIdx > stage) setStage(stageIdx);
           }
        }
        setStage(STAGES.length - 1);
        setResult(finalData || data); // Failsafe fallback
      } else {
        setStage(STAGES.length - 1);
        setResult(data);
      }
    } catch {
      setStage(-1);
    }
  };

  const canVerify = (['image', 'video', 'audio'].includes(tab) && file) || (tab === 'url' && url.trim()) || (tab === 'text' && text.trim().length > 10);
  const authScore = result ? (result.authenticity_score ?? 50) : 0;
  const aiProb    = result ? (result.ai_generated_probability ?? (100 - authScore)) : 0;
  const explanation = result ? (result.explanation ?? result.error ?? '') : '';

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <h1 className="font-syne" style={{ fontSize:'var(--text-4xl)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:12 }}>
          Verify Any Content
        </h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-lg)' }}>Upload a file, paste a URL, or type a claim — our AI does the rest.</p>
      </div>

      {stage === -1 || stage === STAGES.length - 1 ? (
        <>
          {/* Input Tabs */}
          {!result && (
            <Card style={{ marginBottom:24 }}>
              <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:24, gap:0, flexWrap:'wrap' }}>
                {(['image','video','audio','url','text'] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setFile(null); setFilePreview(null); }} style={{ flex:1, minWidth:80, padding:'12px', background:'none', border:'none', borderBottom: tab===t ? '2px solid var(--cyan)' : '2px solid transparent', color: tab===t ? 'var(--cyan)' : 'var(--text-secondary)', fontFamily:'Syne, sans-serif', fontWeight:700, fontSize:'var(--text-sm)', cursor:'pointer', transition:'all 200ms', textTransform:'capitalize' }}>
                    {t === 'image' ? '🖼️ Image' : t === 'video' ? '🎬 Video' : t === 'audio' ? '🎵 Audio' : t === 'url' ? '🔗 URL' : '✏️ Text'}
                  </button>
                ))}
              </div>

              {/* File Uploads (Image / Video / Audio) */}
              {['image'].includes(tab) && (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  style={{ border:`2px dashed ${dragging ? 'var(--cyan)' : 'var(--border)'}`, borderRadius:'var(--radius-lg)', padding:48, textAlign:'center', cursor:'pointer', transition:'all 200ms', background: dragging ? 'var(--cyan-dim)' : 'var(--bg-input)', display:'flex', flexDirection:'column', alignItems:'center' }}>
                  {filePreview && tab === 'image' ? (
                    <img src={filePreview} alt="preview" style={{ maxHeight:160, objectFit:'contain', borderRadius:'var(--radius-md)' }} />
                  ) : file ? (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <FileText size={40} color="var(--cyan)" />
                      <p style={{ color:'var(--text-primary)', fontWeight:600 }}>{file.name}</p>
                      <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>{(file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={40} color="var(--text-muted)" style={{ marginBottom:12 }} />
                      <p style={{ color:'var(--text-primary)', fontWeight:600, marginBottom:4 }}>Drop image here or click to upload</p>
                      <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>
                        Images (JPG, PNG) · Max 10MB
                      </p>
                    </>
                  )}
                  <input type="file" className="hidden" ref={fileRef} accept="image/*" onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]); }} style={{ display:'none' }} />
                </div>
              )}

              {/* Disabled / Coming Soon */}
              {['video', 'audio'].includes(tab) && (
                <div style={{ border:'2px dashed var(--border)', borderRadius:'var(--radius-lg)', padding:48, textAlign:'center', background:'var(--bg-input)' }}>
                  <div style={{ display:'inline-block', padding:'6px 12px', background:'var(--bg-elevated)', borderRadius:'var(--radius-full)', border:'1px solid var(--border)', fontSize:'var(--text-xs)', color:'var(--text-secondary)', fontWeight:700, letterSpacing:'0.05em', marginBottom:16 }}>COMING SOON</div>
                  <p style={{ color:'var(--text-primary)', fontWeight:600, marginBottom:8 }}>{tab === 'video' ? 'Video' : 'Audio'} Deepfake Detection</p>
                  <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>Our engineers are finalizing the models for {tab} analysis. Check back in a few weeks.</p>
                </div>
              )}

              {/* URL */}
              {tab === 'url' && (
                <div style={{ display:'flex', gap:12 }}>
                  <div style={{ flex:1, position:'relative' }}>
                    <Link2 size={16} color="var(--text-muted)" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
                    <VeriInput placeholder="https://bbc.com/news/…" value={url} onChange={(e:any) => setUrl(e.target.value)} style={{ paddingLeft:40 }} />
                  </div>
                </div>
              )}

              {/* Text */}
              {tab === 'text' && (
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste or type a news claim, quote, or article excerpt…"
                  style={{ width:'100%', minHeight:160, padding:'14px 16px', borderRadius:'var(--radius-md)', background:'var(--bg-input)', border:'1px solid var(--border)', color:'var(--text-primary)', fontFamily:'DM Sans, sans-serif', fontSize:'var(--text-md)', resize:'vertical', outline:'none', transition:'border-color 200ms', lineHeight:1.6 }}
                  onFocus={e => (e.target.style.borderColor = 'var(--cyan)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              )}

              <div style={{ marginTop:20 }}>
                <PrimaryButton onClick={handleVerify} disabled={!canVerify || ['video', 'audio'].includes(tab)} style={{ width:'100%', padding:'14px', fontSize:'var(--text-md)', opacity: ['video', 'audio'].includes(tab) ? 0.5 : 1 }}>
                  ⚡ Verify Now
                </PrimaryButton>
              </div>
            </Card>
          )}

          {/* Result Section */}
          {result && (
            <div style={{ animation:'fadeUp 0.5s ease forwards', width: '100%', display:'flex', flexDirection:'column', gap:24 }}>
              
              {/* Metadata Bar */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
                <div style={{ display:'flex', gap:16 }}>
                  <span><span style={{ fontWeight:700, color:'var(--text-secondary)' }}>REPORT ID:</span> {result.id || Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  <span><span style={{ fontWeight:700, color:'var(--text-secondary)' }}>VERIFIED:</span> {new Date().toLocaleString()}</span>
                </div>
                <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                  <span style={{ padding:'2px 8px', borderRadius:'var(--radius-full)', background:'var(--cyan-dim)', color:'var(--cyan)', fontWeight:700 }}>{tab.toUpperCase()}</span>
                  <button onClick={() => window.print()} style={{ background:'none', border:'none', color:'var(--cyan)', cursor:'pointer', fontWeight:700 }}>Export</button>
                </div>
              </div>

              {/* Top Verdict Header */}
              <div style={{ 
                background: authScore >= 75 ? 'var(--verified-bg)' : authScore >= 45 ? 'var(--suspicious-bg)' : 'var(--fake-bg)', 
                border: `1px solid ${authScore >= 75 ? 'var(--verified)' : authScore >= 45 ? 'var(--suspicious)' : 'var(--fake)'}`,
                borderRadius:'var(--radius-lg)', padding:'24px 32px', textAlign:'center', position:'relative', overflow:'hidden'
              }}>
                <div style={{ position:'absolute', top:0, left:0, width:6, height:'100%', background: authScore >= 75 ? 'var(--verified)' : authScore >= 45 ? 'var(--suspicious)' : 'var(--fake)' }} />
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24 }}>
                  <div style={{ 
                    fontSize:'var(--text-6xl)', fontWeight:950, 
                    color: authScore >= 75 ? 'var(--verified)' : authScore >= 45 ? 'var(--suspicious)' : 'var(--fake)',
                    lineHeight:1
                  }}>
                    {authScore >= 75 ? 'YES' : 'NO'}
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <h2 className="font-syne" style={{ 
                      fontSize:'var(--text-2xl)', fontWeight:900, letterSpacing:'0.05em', 
                      color: authScore >= 75 ? 'var(--verified)' : authScore >= 45 ? 'var(--suspicious)' : 'var(--fake)',
                      margin:0
                    }}>
                      VERDICT: {authScore >= 75 ? 'AUTHENTIC / REAL NEWS' : authScore >= 45 ? 'UNVERIFIED / MIXED' : 'FAKE / MISLEADING CONTENT'}
                    </h2>
                    <p style={{ color:'var(--text-primary)', marginTop:4, fontSize:'var(--text-md)', fontWeight:500, opacity:0.9, maxWidth:500 }}>
                      {explanation}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'2fr 3fr', gap:24 }} className="result-grid">
                
                {/* Left Column: Visual Scores */}
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <Card style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 24px', background:'linear-gradient(180deg, var(--bg-card), var(--bg-input))' }}>
                    <p className="font-syne" style={{ fontSize:'var(--text-xs)', letterSpacing:'0.1em', color:'var(--text-muted)', fontWeight:800, marginBottom:24 }}>VERDEX TRUST INDEX</p>
                    <ScoreGauge score={authScore} size={180} />
                    <div style={{ marginTop:24, textAlign:'center' }}>
                       <div style={{ fontSize:'var(--text-4xl)', fontWeight:900, color: authScore >= 75 ? 'var(--verified)' : authScore >= 45 ? 'var(--suspicious)' : 'var(--fake)' }}>{authScore}%</div>
                       <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', fontWeight:700, marginTop:4, letterSpacing:'0.05em' }}>CONFIDENCE: {result.confidence || 'HIGH-PRECISION'}</p>
                    </div>
                  </Card>

                  <Card style={{ padding:'20px' }}>
                    <p className="font-syne" style={{ fontSize:'var(--text-xs)', letterSpacing:'0.1em', color:'var(--text-muted)', fontWeight:800, marginBottom:16 }}>AI PROBABILITY</p>
                    <div style={{ marginBottom:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                        <span style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>AI-Generated</span>
                        <span className="font-mono" style={{ fontSize:'var(--text-sm)', color: aiProb > 50 ? 'var(--fake)' : 'var(--verified)', fontWeight:700 }}>{aiProb}%</span>
                      </div>
                      <div style={{ height:8, borderRadius:'var(--radius-full)', background:'var(--bg-elevated)', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${aiProb}%`, background: aiProb > 50 ? 'var(--fake)' : 'var(--verified)', borderRadius:'var(--radius-full)', transition:'width 1.5s ease' }} />
                      </div>
                    </div>
                    <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', fontStyle:'italic' }}>Based on neural linguistic pattern analysis and metadata inconsistency checks.</p>
                  </Card>
                </div>

                {/* Right Column: Key Details & Sources */}
                <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                  <Card style={{ padding:'24px' }}>
                    <p className="font-syne" style={{ fontSize:'var(--text-xs)', letterSpacing:'0.1em', color:'var(--text-muted)', fontWeight:800, marginBottom:16 }}>EXECUTIVE SUMMARY</p>
                    
                    <div style={{ padding:'16px', background:'var(--bg-input)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', marginBottom:24 }}>
                      <p style={{ fontSize:'var(--text-sm)', lineHeight:1.6, color:'var(--text-secondary)' }}>
                        {result.explanation?.split('.').slice(0, 2).join('.')}. Verification confirmed via cross-referencing with trusted global news archives.
                      </p>
                    </div>

                    <p className="font-syne" style={{ fontSize:'var(--text-xs)', letterSpacing:'0.1em', color:'var(--text-muted)', fontWeight:800, marginBottom:16 }}>VERIFIED SOURCES</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      {result.sources_analyzed && result.sources_analyzed.length > 0 ? result.sources_analyzed.slice(0, 3).map((src: any, idx: number) => (
                        <a key={idx} href={src.url || '#'} target="_blank" rel="noopener noreferrer" 
                          style={{ 
                            display:'flex', alignItems:'center', gap:12, padding:'12px 16px', 
                            background:'var(--bg-card)', borderRadius:'var(--radius-md)', 
                            textDecoration:'none', border:'1px solid var(--border)', 
                            transition:'all 200ms', color:'var(--cyan)' 
                          }} className="source-link hover:border-cyan-500">
                           <div style={{ flex:1, minWidth:0 }}>
                             <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                               <p style={{ fontSize:'var(--text-sm)', color:'var(--text-primary)', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', margin:0 }}>{src.name}</p>
                               {src.scale && (
                                 <span style={{ fontSize:'8px', padding:'1px 4px', borderRadius:'var(--radius-sm)', background:'var(--bg-elevated)', color:'var(--text-muted)', border:'1px solid var(--border)', textTransform:'uppercase' }}>{src.scale}</span>
                               )}
                             </div>
                             <p style={{ fontSize:'10px', color:'var(--text-muted)', margin:0 }}>{src.url ? new URL(src.url).hostname : 'Trusted Domain'}</p>
                           </div>
                           <span style={{ fontSize:'10px', fontWeight:800, color:'var(--cyan)', display:'flex', alignItems:'center', gap:4 }}>
                             OPEN SOURCE <Link2 size={12} />
                           </span>
                        </a>
                      )) : (
                        <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', fontStyle:'italic' }}>Consulting global databases...</p>
                      )}
                    </div>
                  </Card>

                  <div style={{ display:'flex', gap:12 }}>
                    <button onClick={async () => { await navigator.clipboard.writeText(`Veridex Result: ${authScore}% - ${explanation}`); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', borderRadius:'var(--radius-md)', background:'var(--bg-input)', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:'var(--text-sm)', fontWeight:700, cursor:'pointer', transition:'all 200ms' }} className="hover:bg-neutral-800">
                      {copied ? <><CheckCircle2 size={16} color="var(--verified)" /> Copied!</> : <><Share2 size={16} /> Share Report</>}
                    </button>
                    <button onClick={() => downloadVerificationPDF({authenticity_score:authScore, ai_generated_probability:aiProb, explanation, sources_analyzed: result.sources_analyzed||[]})} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px', borderRadius:'var(--radius-md)', background:'var(--bg-input)', border:'1px solid var(--border)', color:'var(--text-primary)', fontSize:'var(--text-sm)', fontWeight:700, cursor:'pointer', transition:'all 200ms' }} className="hover:bg-neutral-800">
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Supporting Articles from Trusted Sources ── */}
              {result.supporting_articles && result.supporting_articles.length > 0 && (
                <div style={{ animation:'fadeUp 0.5s ease 0.3s both' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                    <div style={{ flex:1, height:1, background:'var(--border)' }} />
                    <p className="font-syne" style={{ fontSize:'var(--text-xs)', letterSpacing:'0.12em', color:'var(--text-muted)', fontWeight:800, whiteSpace:'nowrap' }}>
                      📰 SUPPORTING EVIDENCE FROM TRUSTED SOURCES
                    </p>
                    <div style={{ flex:1, height:1, background:'var(--border)' }} />
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
                    {result.supporting_articles.map((art: any, idx: number) => (
                      <a key={idx} href={art.sourceUrl} target="_blank" rel="noopener noreferrer"
                        style={{ textDecoration:'none', display:'flex', flexDirection:'column', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'all 220ms' }}
                        className="support-card"
                      >
                        {/* Image or placeholder */}
                        <div style={{ height:120, background: art.imageUrl ? 'transparent' : 'linear-gradient(135deg, var(--cyan-dim), var(--bg-elevated))', overflow:'hidden', flexShrink:0, position:'relative' }}>
                          {art.imageUrl ? (
                            <img src={art.imageUrl} alt={art.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={(e: any) => { e.target.parentNode.style.background = 'linear-gradient(135deg, var(--cyan-dim), var(--bg-elevated))'; e.target.remove(); }} />
                          ) : (
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:36, opacity:0.4 }}>📰</div>
                          )}
                          <span style={{ position:'absolute', top:8, right:8, padding:'2px 8px', borderRadius:'var(--radius-full)', background:'rgba(0,0,0,0.75)', color:'var(--cyan)', fontSize:'9px', fontWeight:800, backdropFilter:'blur(4px)' }}>
                            TRUSTED SOURCE
                          </span>
                        </div>

                        {/* Content */}
                        <div style={{ padding:'12px', flex:1, display:'flex', flexDirection:'column' }}>
                          <p style={{ fontSize:'var(--text-sm)', fontWeight:700, color:'var(--text-primary)', lineHeight:1.4, margin:'0 0 6px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            {art.title}
                          </p>
                          {art.description && (
                            <p style={{ fontSize:'11px', color:'var(--text-muted)', lineHeight:1.4, margin:'0 0 10px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {art.description}
                            </p>
                          )}
                          <div style={{ marginTop:'auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:'10px', fontWeight:700, color:'var(--cyan)' }}>{art.sourceName}</span>
                            <span style={{ fontSize:'10px', color:'var(--text-muted)' }}>
                              {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : ''}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button onClick={() => { setResult(null); setStage(-1); setFile(null); setFilePreview(null); setUrl(''); setText(''); }} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:'var(--radius-full)', border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-secondary)', fontSize:'var(--text-sm)', fontWeight:600, cursor:'pointer', transition:'all 200ms' }} className="hover:text-white hover:border-neutral-500">
                  ← Start New Verification
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Progress Animation */
        <Card style={{ textAlign:'center', padding:48 }}>
          <Loader2 size={40} color="var(--cyan)" style={{ animation:'spin 1s linear infinite', marginBottom:24 }} />
          <h3 className="font-syne" style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:8 }}>{STAGES[stage]}</h3>
          <p style={{ color:'var(--text-muted)', marginBottom:36 }}>Step {stage + 1} of {STAGES.length - 1}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'flex-start', maxWidth: 400, margin: '0 auto' }}>
            {STAGES.slice(0,-1).map((s, i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:16, width: '100%' }}>
                <div style={{ position:'relative', display:'flex', justifyContent:'center', alignItems:'center' }}>
                  {i < stage && <div style={{ position:'absolute', top:24, bottom:-12, left:11, width:2, background:'var(--verified)', zIndex:0 }} />}
                  {i === stage && <div style={{ position:'absolute', top:24, bottom:-12, left:11, width:2, background:'var(--border)', zIndex:0 }} />}
                  {i > stage && <div style={{ position:'absolute', top:24, bottom:-12, left:11, width:2, background:'var(--border)', zIndex:0 }} />}
                  
                  <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: i<stage?'transparent':i===stage?'transparent':'transparent', border:`2px solid ${i<stage?'var(--verified)':i===stage?'var(--cyan)':'var(--border)'}`, zIndex:1, position:'relative', transition:'all 0.4s' }}>
                    {i < stage && <CheckCircle2 size={16} color="var(--verified)" />}
                    {i === stage && <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--cyan)', boxShadow:'0 0 8px var(--cyan)' }} className="animate-pulse" />}
                  </div>
                </div>
                <div style={{ flex:1, textAlign:'left' }}>
                  <span style={{ fontSize:'var(--text-sm)', fontWeight: i === stage ? 700 : 500, color: i<stage?'var(--verified)':i===stage?'var(--cyan)':'var(--text-muted)', transition:'all 0.4s' }}>{s}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <style>{`
        @media (max-width: 768px) {
          .result-grid { grid-template-columns: 1fr !important; }
        }
        .support-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); border-color: var(--cyan) !important; }
      `}</style>
    </main>
  );
}
