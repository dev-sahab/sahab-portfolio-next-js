'use client'
import { useState } from 'react'
import Link from 'next/link'

const DATA = {
  services: {
    'new-design-uiux': { min: 6, max: 10, label: 'New design with UI/UX' },
    'new-design-only': { min: 4, max: 7,  label: 'New design (dev only)' },
    'redesign':        { min: 3, max: 6,  label: 'Redesign existing site' },
    'fix-improve':     { min: 1, max: 3,  label: 'Fix / customize site' },
    'maintenance':     { min: 1, max: 2,  label: 'Maintenance & support' },
    'seo':             { min: 2, max: 4,  label: 'SEO support' },
  } as Record<string, { min: number; max: number; label: string }>,
  extraWksPerPage: 0.4,
  platforms: { wordpress: 0, webflow: 0, framer: 1, mern: 2, 'no-pref': 0 } as Record<string, number>,
  timeline: { standard: 0, expedited: -1, rush: -2, flexible: 1 } as Record<string, number>,
  features: { 'advanced-interactions': 1, 'mega-menu': 0, 'ecommerce-feat': 2, 'email-integration': 0, accessibility: 1, hubspot: 1, memberstack: 2, 'seo-setup': 1, multilingual: 1 } as Record<string, number>,
}

const RULES: Record<string, { show: string[]; hide: string[] }> = {
  'new-design': { show: ['s-platform','s-pages','s-type','s-cms','s-timeline','s-features','s-notes'], hide: [] },
  'redesign':   { show: ['s-platform','s-pages','s-type','s-cms','s-timeline','s-features','s-notes'], hide: [] },
  'fix-improve':{ show: ['s-platform','s-type','s-timeline','s-features','s-notes'], hide: ['s-pages','s-cms'] },
  'maintenance':{ show: ['s-timeline','s-notes'], hide: ['s-platform','s-pages','s-type','s-cms','s-features'] },
  'seo':        { show: ['s-timeline','s-notes'], hide: ['s-platform','s-pages','s-type','s-cms','s-features'] },
}

const MINI_TESTIS = [
  { name: 'James R.', role: 'SaaS Founder', text: '"Sahab\'s estimate was spot-on and delivery was even better. Transparent and genuinely talented."' },
  { name: 'Nina P.', role: 'Agency Lead', text: '"Delivered on time, within budget. The client was over the moon."' },
  { name: 'Layla M.', role: 'E-commerce Director', text: '"Conversion rate up 38% after the rebuild. Best hire I\'ve made for web work."' },
]

export default function GetQuotePage() {
  const [service, setService] = useState('new-design')
  const [uiux, setUiux] = useState('include')
  const [platform, setPlatform] = useState('wordpress')
  const [pages, setPages] = useState(5)
  const [websiteType, setWebsiteType] = useState('portfolio')
  const [timeline, setTimeline] = useState('standard')
  const [features, setFeatures] = useState<string[]>([])
  const [cms, setCms] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [resMsg, setResMsg] = useState('')
  const [miniIdx, setMiniIdx] = useState(0)

  // Auto-rotate mini testimonials
  useState(() => { const id = setInterval(() => setMiniIdx((i) => (i + 1) % MINI_TESTIS.length), 4000); return () => clearInterval(id) })

  const visible = (id: string) => {
    const rule = RULES[service] || RULES['new-design']
    return rule.show.includes(id) && !rule.hide.includes(id)
  }

  const calcTimeline = () => {
    const key = service === 'new-design' ? (uiux === 'include' ? 'new-design-uiux' : 'new-design-only') : service
    const sd = DATA.services[key] || { min: 3, max: 6, label: 'Custom project' }
    let mn = sd.min, mx = sd.max
    const extra = Math.max(0, pages - 5) * DATA.extraWksPerPage; mn += extra; mx += extra
    if (DATA.platforms[platform] !== undefined) { mn += DATA.platforms[platform]; mx += DATA.platforms[platform] }
    if (DATA.timeline[timeline]) { mn += DATA.timeline[timeline]; mx += DATA.timeline[timeline] }
    features.forEach((f) => { if (DATA.features[f]) { mn += DATA.features[f]; mx += DATA.features[f] } })
    mn = Math.max(1, Math.round(mn)); mx = Math.max(mn + 1, Math.round(mx))
    return { label: sd.label, value: `${mn} – ${mx} weeks` }
  }

  const tl = calcTimeline()

  const toggleFeature = (f: string) => setFeatures((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f])
  const toggleCms = (f: string) => setCms((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f])

  const handleSubmit = async () => {
    if (!name.trim()) { setStatus('error'); setResMsg('Please enter your name.'); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus('error'); setResMsg('Please enter a valid email.'); return }
    setStatus('loading')
    const res = await fetch('/api/quote', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, url, service, uiux, platform, pages, websiteType, timeline, features, notes, estimatedTimeline: tl.value }),
    })
    const data = await res.json()
    if (data.success) { setStatus('success'); setResMsg(`✓ Thanks ${name}! I'll reply within 24 hours.`) }
    else { setStatus('error'); setResMsg(data.error || 'Something went wrong.') }
  }

  const S = {
    section: { padding: '28px 0', borderBottom: '1px solid var(--border)' } as React.CSSProperties,
    title: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 16, letterSpacing: '-.01em', marginBottom: 16 } as React.CSSProperties,
    qnum: { fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', color: 'var(--accent)', background: 'rgba(184,255,79,.1)', padding: '3px 9px', borderRadius: 100, border: '1px solid rgba(184,255,79,.2)' } as React.CSSProperties,
    opts: { display: 'flex', flexWrap: 'wrap' as const, gap: 8 },
    opt: (sel: boolean) => ({ display: 'flex', alignItems: 'center', padding: '9px 16px', border: `1px solid ${sel ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 100, cursor: 'pointer', fontSize: 13, background: sel ? 'var(--accent)' : 'transparent', color: sel ? 'var(--bg)' : 'var(--text2)', fontWeight: sel ? 600 : 400, transition: 'all .2s', userSelect: 'none' as const }),
    check: (sel: boolean) => ({ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', border: `1px solid ${sel ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 13, background: sel ? 'rgba(184,255,79,.07)' : 'transparent', color: sel ? 'var(--text)' : 'var(--text2)', transition: 'all .2s', userSelect: 'none' as const }),
    box: (sel: boolean) => ({ width: 17, height: 17, border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--bg)', background: sel ? 'var(--accent)' : 'transparent', flexShrink: 0, transition: 'all .2s' }),
    inp: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 'var(--r)', padding: '10px 13px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--f-b)' } as React.CSSProperties,
    lbl: { display: 'block', fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.15em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 5 },
  }

  return (
    <main>
      <section style={{ padding: '140px 0 60px', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 17, display: 'flex', gap: 8 }}>
            <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link><span>/</span><span>Get a Quote</span>
          </div>
          <h1 className="h-xl">Get a <span className="accent-word">Quote</span></h1>
          <p style={{ fontSize: 16, color: 'var(--text2)', marginTop: 14, maxWidth: 500, lineHeight: 1.65 }}>Answer a few questions and get an estimated timeline. Sections adapt automatically.</p>
        </div>
      </section>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 56, alignItems: 'start', padding: '60px 0 100px' }}>

          {/* LEFT: FORM */}
          <div>
            {/* Q1 Service */}
            <div style={S.section}>
              <div style={S.title}><span style={S.qnum}>01</span>What are you looking for?</div>
              <div style={S.opts}>
                {[['new-design','New design'],['redesign','Redesign existing'],['fix-improve','Fix / improve'],['maintenance','Maintenance'],['seo','SEO support']].map(([v,l]) => (
                  <div key={v} style={S.opt(service===v)} onClick={() => setService(v)}>{l}</div>
                ))}
              </div>
              {service === 'new-design' && (
                <div style={{ marginTop: 12, padding: '14px 16px', background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>UI/UX Design included?</div>
                  <div style={S.opts}>
                    {[['include','Yes, include UI/UX design'],['only','No — I have a Figma (dev only)']].map(([v,l]) => (
                      <div key={v} style={{ ...S.opt(uiux===v), fontSize: 12 }} onClick={() => setUiux(v)}>{l}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Q2 Platform */}
            {visible('s-platform') && (
              <div style={S.section}>
                <div style={S.title}><span style={S.qnum}>02</span>Preferred platform?</div>
                <div style={S.opts}>
                  {[['wordpress','WordPress'],['webflow','Webflow'],['framer','Framer'],['mern','MERN Stack'],['no-pref','No preference']].map(([v,l]) => (
                    <div key={v} style={S.opt(platform===v)} onClick={() => setPlatform(v)}>{l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Q3 Pages */}
            {visible('s-pages') && (
              <div style={S.section}>
                <div style={S.title}><span style={S.qnum}>03</span>How many pages?</div>
                <div style={{ padding: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, color: 'var(--text2)' }}>Unique page designs</span>
                    <span style={{ fontFamily: 'var(--f-m)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{pages === 25 ? '25+' : pages} pages</span>
                  </div>
                  <input type="range" min={1} max={25} value={pages} onChange={(e) => setPages(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--muted)' }}><span>1</span><span>25+</span></div>
                </div>
              </div>
            )}

            {/* Q4 Website type */}
            {visible('s-type') && (
              <div style={S.section}>
                <div style={S.title}><span style={S.qnum}>04</span>Type of website?</div>
                <div style={S.opts}>
                  {['Portfolio','Agency','Business','Blog','Landing Page','SaaS / App','E-commerce','Other'].map((v) => (
                    <div key={v} style={S.opt(websiteType===v.toLowerCase().replace(/\s+/g,'-'))} onClick={() => setWebsiteType(v.toLowerCase().replace(/\s+/g,'-'))}>{v}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Q5 CMS */}
            {visible('s-cms') && (
              <div style={S.section}>
                <div style={S.title}><span style={S.qnum}>05</span>CMS content types? <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>(select all)</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[['portfolio-items','Portfolio items'],['team','Team members'],['blog','Blog / articles'],['events','Events'],['services','Services'],['careers','Job listings'],['testimonials','Testimonials'],['products','Products'],['faqs','FAQs']].map(([v,l]) => (
                    <div key={v} style={S.check(cms.includes(v))} onClick={() => toggleCms(v)}>
                      <div style={S.box(cms.includes(v))}>{cms.includes(v) ? '✓' : ''}</div>{l}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q6 Timeline */}
            {visible('s-timeline') && (
              <div style={S.section}>
                <div style={S.title}><span style={S.qnum}>06</span>When do you need it?</div>
                <div style={S.opts}>
                  {[['standard','Standard (flexible)'],['expedited','Expedited (sooner)'],['rush','Rush (ASAP)'],['flexible','Very flexible']].map(([v,l]) => (
                    <div key={v} style={S.opt(timeline===v)} onClick={() => setTimeline(v)}>{l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Q7 Features */}
            {visible('s-features') && (
              <div style={S.section}>
                <div style={S.title}><span style={S.qnum}>07</span>Additional features? <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>(select all)</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[['advanced-interactions','Advanced animations'],['mega-menu','Complex navigation'],['ecommerce-feat','E-commerce checkout'],['email-integration','Email / CRM'],['accessibility','WCAG accessibility'],['hubspot','HubSpot'],['memberstack','Membership / gating'],['seo-setup','Technical SEO'],['multilingual','Multilingual']].map(([v,l]) => (
                    <div key={v} style={S.check(features.includes(v))} onClick={() => toggleFeature(v)}>
                      <div style={S.box(features.includes(v))}>{features.includes(v) ? '✓' : ''}</div>{l}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q8 Notes */}
            {visible('s-notes') && (
              <div style={S.section}>
                <div style={S.title}><span style={S.qnum}>08</span>Anything else to share?</div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...S.inp, minHeight: 110, resize: 'vertical', lineHeight: 1.6 }} placeholder="Reference site, Figma link, brand notes, deadline — anything useful." />
              </div>
            )}
          </div>

          {/* RIGHT: PANEL */}
          <div style={{ position: 'sticky', top: 100, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: 'var(--accent)', color: 'var(--bg)', padding: '15px 20px', fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 13, letterSpacing: '-.01em' }}>Project Estimate</div>
            <div style={{ padding: 20 }}>
              {/* Fields */}
              {[['Name *', name, setName, 'text', 'John Smith'],['Email *', email, setEmail, 'email', 'john@company.com'],['Website URL', url, setUrl, 'url', 'https://yoursite.com']].map(([l,v,fn,t,ph]) => (
                <div key={l as string} style={{ marginBottom: 12 }}>
                  <label style={S.lbl}>{l as string}</label>
                  <input type={t as string} value={v as string} onChange={(e) => (fn as any)(e.target.value)} style={S.inp} placeholder={ph as string} />
                </div>
              ))}

              {/* Timeline */}
              <div style={{ border: '1px solid rgba(184,255,79,.2)', borderRadius: 'var(--r)', padding: '14px 16px', margin: '14px 0', background: 'rgba(184,255,79,.04)' }}>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>Estimated Timeline</div>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 20, color: 'var(--accent)', letterSpacing: '-.01em' }}>{tl.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>For: {tl.label}</div>
              </div>

              <button onClick={handleSubmit} disabled={status === 'loading'} style={{ width: '100%', padding: 13, background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--r)', fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: 12, opacity: status === 'loading' ? .7 : 1, transition: 'background .28s' }}>
                {status === 'loading' ? 'Sending…' : 'Submit Details'}
              </button>

              <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, color: 'var(--muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
                <span>Accepts</span>
                {['PayPal','Wise','bKash','Bank'].map((p) => <span key={p} style={{ padding: '3px 7px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 10, color: 'var(--text2)' }}>{p}</span>)}
              </div>

              {status !== 'idle' && (
                <div style={{ padding: '10px 12px', borderRadius: 'var(--r)', marginBottom: 12, fontSize: 11, fontFamily: 'var(--f-m)', background: status === 'success' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', color: status === 'success' ? '#22c55e' : '#ef4444', border: `1px solid ${status === 'success' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}` }}>
                  {resMsg}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {['Free consultation call included','Reply within 24 hours','30-day bug-fix guarantee','100+ projects shipped'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--accent)', fontSize: 12 }}>✓</span>{t}
                  </div>
                ))}
              </div>

              {/* Mini testimonial */}
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--r)', padding: 16, overflow: 'hidden' }}>
                <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text2)', lineHeight: 1.7, marginBottom: 10 }}>{MINI_TESTIS[miniIdx].text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 12, color: 'var(--bg)', flexShrink: 0 }}>{MINI_TESTIS[miniIdx].name[0]}</div>
                  <div><div style={{ fontSize: 12, fontWeight: 600 }}>{MINI_TESTIS[miniIdx].name}</div><div style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{MINI_TESTIS[miniIdx].role}</div></div>
                  <div style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 10 }}>★★★★★</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
