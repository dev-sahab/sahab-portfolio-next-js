'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import AnimatedSection from '@/components/site/AnimatedSection'
import { getSocialPlatform } from '@/components/site/socialIcons'
import type { SocialLink } from '@/types'
import '@/styles/pages/(site)/contact/contact.scss'

const defaultSocial: SocialLink[] = [
  { platform: 'github', url: 'https://github.com/dev-sahab' },
  { platform: 'linkedin', url: 'https://linkedin.com/in/sahab-mi' },
  { platform: 'upwork', url: 'https://upwork.com' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', budget: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [social, setSocial] = useState<SocialLink[]>(defaultSocial)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d.success && d.data.social?.length > 0) setSocial(d.data.social)
    }).catch(() => {})
  }, [])

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

  return (
    <main>
      <section className="page-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <div className="contact-breadcrumb">
            <Link href="/">Home</Link><span>/</span><span>Contact</span>
          </div>
          <h1 className="h-xl">Let's <span className="accent-word">Talk</span></h1>
          <p className="contact-hero-desc">Open for freelance, contracts & full-time roles. I reply within 24 hours.</p>
        </div>
      </section>

      <div className="container">
        <div className="contact-grid">
          {/* LEFT: info */}
          <AnimatedSection from="left">
            <div className="s-label">Direct Contact</div>
            <a href="mailto:frshahab.me@gmail.com" className="contact-email-link">
              frshahab.me@gmail.com ↗
            </a>
            <div className="contact-info-grid">
              {[['Email','frshahab.me@gmail.com'],['Phone','+880 1719 398245'],['Location','Sylhet, Bangladesh'],['Company','PIXELVEGA'],['Response','Within 24 hours'],['Timezone','BST (UTC+6)']].map(([k,v]) => (
                <div key={k} className="contact-info-item">
                  <div className="contact-info-item-label">{k}</div>
                  <div className="contact-info-item-value">{v}</div>
                </div>
              ))}
            </div>
            <div className="s-label">Find Me On</div>
            <div className="d-flex flex-wrap gap-3">
              {social.filter((s) => s.url).map((s) => {
                const { label, icon: Icon } = getSocialPlatform(s.platform)
                return (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener" className="btn btn-outline contact-social-link">
                    <Icon size={13} /> {label} ↗
                  </a>
                )
              })}
            </div>
          </AnimatedSection>

          {/* RIGHT: form */}
          <AnimatedSection>
            <div className="s-label">Send a Message</div>
            <h2 className="contact-form-title">Tell me about your <span className="accent-word">project</span></h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="contact-form-row">
                <div><label className="contact-label">Name *</label><input required value={form.name} onChange={(e) => set('name', e.target.value)} className="form-input" placeholder="Your name" /></div>
                <div><label className="contact-label">Email *</label><input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className="form-input" placeholder="your@email.com" /></div>
              </div>
              <div className="contact-form-row">
                <div>
                  <label className="contact-label">Project Type</label>
                  <select value={form.subject} onChange={(e) => set('subject', e.target.value)} className="form-input">
                    <option value="">Select…</option>
                    {['WordPress Development','Webflow Build','WooCommerce Store','MERN Stack App','Framer Site','Landing Page','Consulting','Other'].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="contact-label">Budget Range</label>
                  <select value={form.budget} onChange={(e) => set('budget', e.target.value)} className="form-input">
                    <option value="">Prefer not to say</option>
                    {['Under $500','$500–$1,500','$1,500–$5,000','$5,000+'].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="contact-field">
                <label className="contact-label">Message *</label>
                <textarea required value={form.message} onChange={(e) => set('message', e.target.value)} className="form-input contact-textarea" placeholder="Describe your project — goals, timeline, specific requirements…" />
              </div>
              {status !== 'idle' && (
                <div className={`contact-status ${status === 'success' ? 'contact-status--success' : 'contact-status--error'}`}>
                  {msg}
                </div>
              )}
              <button type="submit" disabled={status === 'loading'} className={`btn btn-accent contact-submit ${status === 'loading' ? 'is-loading' : ''}`}>
                {status === 'loading' ? 'Sending…' : 'Send Message →'}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </main>
  )
}
