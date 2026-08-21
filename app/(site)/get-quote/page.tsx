'use client'
import { useState } from 'react'
import Link from 'next/link'
import '@/styles/pages/(site)/get-quote/get-quote.scss'

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

  return (
    <main>
      <section className="gq-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <div className="gq-breadcrumb">
            <Link href="/">Home</Link><span>/</span><span>Get a Quote</span>
          </div>
          <h1 className="h-xl">Get a <span className="accent-word">Quote</span></h1>
          <p className="gq-hero-desc">Answer a few questions and get an estimated timeline. Sections adapt automatically.</p>
        </div>
      </section>

      <div className="container">
        <div className="gq-layout-grid">

          {/* LEFT: FORM */}
          <div>
            {/* Q1 Service */}
            <div className="gq-section">
              <div className="gq-question-title"><span className="gq-qnum rounded-full">01</span>What are you looking for?</div>
              <div className="d-flex flex-wrap gap-2">
                {[['new-design','New design'],['redesign','Redesign existing'],['fix-improve','Fix / improve'],['maintenance','Maintenance'],['seo','SEO support']].map(([v,l]) => (
                  <div key={v} className={`gq-opt${service === v ? ' selected' : ''}`} onClick={() => setService(v)}>{l}</div>
                ))}
              </div>
              {service === 'new-design' && (
                <div className="gq-uiux-box">
                  <div className="gq-uiux-label">UI/UX Design included?</div>
                  <div className="d-flex flex-wrap gap-2">
                    {[['include','Yes, include UI/UX design'],['only','No — I have a Figma (dev only)']].map(([v,l]) => (
                      <div key={v} className={`gq-opt small${uiux === v ? ' selected' : ''}`} onClick={() => setUiux(v)}>{l}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Q2 Platform */}
            {visible('s-platform') && (
              <div className="gq-section">
                <div className="gq-question-title"><span className="gq-qnum rounded-full">02</span>Preferred platform?</div>
                <div className="d-flex flex-wrap gap-2">
                  {[['wordpress','WordPress'],['webflow','Webflow'],['framer','Framer'],['mern','MERN Stack'],['no-pref','No preference']].map(([v,l]) => (
                    <div key={v} className={`gq-opt${platform === v ? ' selected' : ''}`} onClick={() => setPlatform(v)}>{l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Q3 Pages */}
            {visible('s-pages') && (
              <div className="gq-section">
                <div className="gq-question-title"><span className="gq-qnum rounded-full">03</span>How many pages?</div>
                <div className="gq-pages-block">
                  <div className="d-flex justify-between items-center mb-3">
                    <span className="gq-pages-label">Unique page designs</span>
                    <span className="gq-pages-value">{pages === 25 ? '25+' : pages} pages</span>
                  </div>
                  <input type="range" min={1} max={25} value={pages} onChange={(e) => setPages(Number(e.target.value))} className="w-full gq-range" />
                  <div className="d-flex justify-between gq-range-ticks"><span>1</span><span>25+</span></div>
                </div>
              </div>
            )}

            {/* Q4 Website type */}
            {visible('s-type') && (
              <div className="gq-section">
                <div className="gq-question-title"><span className="gq-qnum rounded-full">04</span>Type of website?</div>
                <div className="d-flex flex-wrap gap-2">
                  {['Portfolio','Agency','Business','Blog','Landing Page','SaaS / App','E-commerce','Other'].map((v) => (
                    <div key={v} className={`gq-opt${websiteType === v.toLowerCase().replace(/\s+/g,'-') ? ' selected' : ''}`} onClick={() => setWebsiteType(v.toLowerCase().replace(/\s+/g,'-'))}>{v}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Q5 CMS */}
            {visible('s-cms') && (
              <div className="gq-section">
                <div className="gq-question-title"><span className="gq-qnum rounded-full">05</span>CMS content types? <span className="gq-hint">(select all)</span></div>
                <div className="gq-checkbox-grid">
                  {[['portfolio-items','Portfolio items'],['team','Team members'],['blog','Blog / articles'],['events','Events'],['services','Services'],['careers','Job listings'],['testimonials','Testimonials'],['products','Products'],['faqs','FAQs']].map(([v,l]) => (
                    <div key={v} className={`gq-check${cms.includes(v) ? ' selected' : ''}`} onClick={() => toggleCms(v)}>
                      <div className={`gq-checkbox${cms.includes(v) ? ' selected' : ''}`}>{cms.includes(v) ? '✓' : ''}</div>{l}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q6 Timeline */}
            {visible('s-timeline') && (
              <div className="gq-section">
                <div className="gq-question-title"><span className="gq-qnum rounded-full">06</span>When do you need it?</div>
                <div className="d-flex flex-wrap gap-2">
                  {[['standard','Standard (flexible)'],['expedited','Expedited (sooner)'],['rush','Rush (ASAP)'],['flexible','Very flexible']].map(([v,l]) => (
                    <div key={v} className={`gq-opt${timeline === v ? ' selected' : ''}`} onClick={() => setTimeline(v)}>{l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Q7 Features */}
            {visible('s-features') && (
              <div className="gq-section">
                <div className="gq-question-title"><span className="gq-qnum rounded-full">07</span>Additional features? <span className="gq-hint">(select all)</span></div>
                <div className="gq-checkbox-grid">
                  {[['advanced-interactions','Advanced animations'],['mega-menu','Complex navigation'],['ecommerce-feat','E-commerce checkout'],['email-integration','Email / CRM'],['accessibility','WCAG accessibility'],['hubspot','HubSpot'],['memberstack','Membership / gating'],['seo-setup','Technical SEO'],['multilingual','Multilingual']].map(([v,l]) => (
                    <div key={v} className={`gq-check${features.includes(v) ? ' selected' : ''}`} onClick={() => toggleFeature(v)}>
                      <div className={`gq-checkbox${features.includes(v) ? ' selected' : ''}`}>{features.includes(v) ? '✓' : ''}</div>{l}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q8 Notes */}
            {visible('s-notes') && (
              <div className="gq-section">
                <div className="gq-question-title"><span className="gq-qnum rounded-full">08</span>Anything else to share?</div>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="gq-input gq-textarea" placeholder="Reference site, Figma link, brand notes, deadline — anything useful." />
              </div>
            )}
          </div>

          {/* RIGHT: PANEL */}
          <div className="gq-panel-sticky">
            <div className="gq-panel-header">Project Estimate</div>
            <div className="gq-panel-body">
              {/* Fields */}
              {[['Name *', name, setName, 'text', 'John Smith'],['Email *', email, setEmail, 'email', 'john@company.com'],['Website URL', url, setUrl, 'url', 'https://yoursite.com']].map(([l,v,fn,t,ph]) => (
                <div key={l as string} className="mb-3">
                  <label className="gq-label">{l as string}</label>
                  <input type={t as string} value={v as string} onChange={(e) => (fn as any)(e.target.value)} className="gq-input" placeholder={ph as string} />
                </div>
              ))}

              {/* Timeline */}
              <div className="gq-estimate-box">
                <div className="gq-estimate-label">Estimated Timeline</div>
                <div className="gq-estimate-value">{tl.value}</div>
                <div className="gq-estimate-for">For: {tl.label}</div>
              </div>

              <button onClick={handleSubmit} disabled={status === 'loading'} className={`gq-submit-btn${status === 'loading' ? ' loading' : ''}`}>
                {status === 'loading' ? 'Sending…' : 'Submit Details'}
              </button>

              <div className="gq-accepts">
                <span>Accepts</span>
                {['PayPal','Wise','bKash','Bank'].map((p) => <span key={p} className="gq-accept-pill">{p}</span>)}
              </div>

              {status !== 'idle' && (
                <div className={`gq-status-msg${status === 'success' ? ' is-success' : ''}`}>
                  {resMsg}
                </div>
              )}

              <div className="d-flex flex-col gap-2 pt-4 gq-trust-list">
                {['Free consultation call included','Reply within 24 hours','30-day bug-fix guarantee','100+ projects shipped'].map((t) => (
                  <div key={t} className="d-flex items-center gap-2 gq-trust-item">
                    <span className="gq-trust-check">✓</span>{t}
                  </div>
                ))}
              </div>

              {/* Mini testimonial */}
              <div className="p-4 rounded gq-mini-testi">
                <p className="gq-mini-testi-text">{MINI_TESTIS[miniIdx].text}</p>
                <div className="d-flex items-center gq-mini-testi-row">
                  <div className="d-flex items-center justify-center gq-mini-avatar">{MINI_TESTIS[miniIdx].name[0]}</div>
                  <div><div className="gq-mini-name">{MINI_TESTIS[miniIdx].name}</div><div className="gq-mini-role">{MINI_TESTIS[miniIdx].role}</div></div>
                  <div className="gq-mini-stars">★★★★★</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
