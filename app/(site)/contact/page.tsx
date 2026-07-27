'use client'
import { useState } from 'react'
import Link from 'next/link'
import AnimatedSection from '@/components/site/AnimatedSection'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', budget: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (data.success) { setStatus('success'); setMsg("✓ Message sent! I'll reply within 24 hours."); setForm({ name: '', email: '', subject: '', budget: '', message: '' }) }
      else { setStatus('error'); setMsg(data.error || 'Something went wrong.') }
    } catch { setStatus('error'); setMsg('Network error. Email frshahab.me@gmail.com directly.') }
  }

  const inp = { width: '100%', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '13px 16px', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--f-b)', outline: 'none' } as React.CSSProperties
  const lbl = { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 6 }

  return (
    <main>
      <section className="page-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 17, display: 'flex', gap: 8 }}>
            <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link><span>/</span><span>Contact</span>
          </div>
          <h1 className="h-xl">Let's <span className="accent-word">Talk</span></h1>
          <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 540, marginTop: 17, lineHeight: 1.72 }}>Open for freelance, contracts & full-time roles. I reply within 24 hours.</p>
        </div>
      </section>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, padding: '68px 0' }}>
          {/* LEFT: info */}
          <AnimatedSection from="left">
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ width: 22, height: 1, background: 'var(--accent)', display: 'block' }} /> Direct Contact
            </div>
            <a href="mailto:frshahab.me@gmail.com" style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 'clamp(21px,3vw,36px)', letterSpacing: '-.02em', display: 'block', borderBottom: '1px solid transparent', transition: 'border-color .3s,color .3s', margin: '17px 0 34px' }}>
              frshahab.me@gmail.com ↗
            </a>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 34 }}>
              {[['Email','frshahab.me@gmail.com'],['Phone','+880 1719 398245'],['Location','Sylhet, Bangladesh'],['Company','PIXELVEGA'],['Response','Within 24 hours'],['Timezone','BST (UTC+6)']].map(([k,v]) => (
                <div key={k} style={{ background: 'var(--surface)', padding: '18px 20px', borderRadius: 'var(--r)', transition: 'background .3s' }}>
                  <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ width: 22, height: 1, background: 'var(--accent)', display: 'block' }} /> Find Me On
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[['GitHub','https://github.com/dev-sahab'],['LinkedIn','https://linkedin.com/in/sahab-mi'],['Upwork','https://upwork.com']].map(([l,h]) => (
                <a key={l} href={h} target="_blank" rel="noopener" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: 10 }}>{l} ↗</a>
              ))}
            </div>
          </AnimatedSection>

          {/* RIGHT: form */}
          <AnimatedSection>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ width: 22, height: 1, background: 'var(--accent)', display: 'block' }} /> Send a Message
            </div>
            <h2 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 'clamp(20px,2.5vw,32px)', letterSpacing: '-.01em', marginBottom: 30 }}>Tell me about your <span className="accent-word">project</span></h2>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={lbl}>Name *</label><input required value={form.name} onChange={(e) => set('name', e.target.value)} style={inp} placeholder="Your name" /></div>
                <div><label style={lbl}>Email *</label><input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} style={inp} placeholder="your@email.com" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={lbl}>Project Type</label>
                  <select value={form.subject} onChange={(e) => set('subject', e.target.value)} style={{ ...inp, background: 'var(--surface)' }}>
                    <option value="">Select…</option>
                    {['WordPress Development','Webflow Build','WooCommerce Store','MERN Stack App','Framer Site','Landing Page','Consulting','Other'].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Budget Range</label>
                  <select value={form.budget} onChange={(e) => set('budget', e.target.value)} style={{ ...inp, background: 'var(--surface)' }}>
                    <option value="">Prefer not to say</option>
                    {['Under $500','$500–$1,500','$1,500–$5,000','$5,000+'].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Message *</label>
                <textarea required value={form.message} onChange={(e) => set('message', e.target.value)} style={{ ...inp, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }} placeholder="Describe your project — goals, timeline, specific requirements…" />
              </div>
              {status !== 'idle' && (
                <div style={{ padding: '11px 14px', borderRadius: 'var(--r)', marginBottom: 16, fontSize: 13, fontFamily: 'var(--f-m)', background: status === 'success' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', color: status === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${status === 'success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}` }}>
                  {msg}
                </div>
              )}
              <button type="submit" disabled={status === 'loading'} className="btn btn-accent" style={{ opacity: status === 'loading' ? .7 : 1 }}>
                {status === 'loading' ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </main>
  )
}
