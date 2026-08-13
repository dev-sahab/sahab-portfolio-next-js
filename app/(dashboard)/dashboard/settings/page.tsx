'use client'
import { useState, useEffect } from 'react'
import type { SiteSettings, MenuItem, FooterMenuItem } from '@/types'
import ImageUpload from '@/components/dashboard/ImageUpload'
import SocialLinksEditor from '@/components/dashboard/SocialLinksEditor'
import './settings.scss'

const TABS = ['General', 'Profile', 'Header Menu', 'Footer Menu', 'Footer', 'Hero Stats'] as const
type Tab = typeof TABS[number]

const FOOTER_COLUMNS = ['Pages', 'Services', 'Legal']

function MenuItemsEditor({
  items, onChange, withColumn = false,
}: {
  items: (MenuItem | FooterMenuItem)[]
  onChange: (items: (MenuItem | FooterMenuItem)[]) => void
  withColumn?: boolean
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const update = (i: number, patch: Partial<FooterMenuItem>) => {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  const remove = (i: number) => onChange(items.filter((_, j) => j !== i))

  const add = () => onChange([...items, { label: '', href: '', order: items.length, ...(withColumn ? { column: FOOTER_COLUMNS[0] } : {}) }])

  const reorder = (from: number, to: number) => {
    if (from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next.map((it, i) => ({ ...it, order: i })))
  }

  return (
    <div className="settings-stack">
      {items.map((item, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (dragIndex !== null) reorder(dragIndex, i); setDragIndex(null) }}
          onDragEnd={() => setDragIndex(null)}
          className={[
            'settings-menu-row',
            withColumn ? 'with-column' : '',
            dragIndex === i ? 'dragging' : '',
          ].filter(Boolean).join(' ')}
        >
          <span className="settings-drag-handle" title="Drag to reorder">⠿</span>
          <input value={item.label} onChange={e => update(i, { label: e.target.value })} className="settings-input" placeholder="Label" />
          <input value={item.href} onChange={e => update(i, { href: e.target.value })} className="settings-input" placeholder="/path" />
          {withColumn && (
            <select value={(item as FooterMenuItem).column || FOOTER_COLUMNS[0]} onChange={e => update(i, { column: e.target.value })} className="settings-input">
              {FOOTER_COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <button type="button" onClick={() => remove(i)} className="settings-remove-btn">×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="settings-add-btn">
        + Add Menu Item
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<Tab>('General')

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d.success) setSettings(d.data)
      setLoading(false)
    })
  }, [])

  const set = (k: string, v: any) => setSettings((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    const data = await res.json()
    if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  if (loading) return <div className="settings-loading">Loading settings…</div>

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Site Settings</h1>
        <button type="button" onClick={handleSave} disabled={saving} className="settings-save-btn">
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-tabs">
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} className={tab === t ? 'settings-tab active' : 'settings-tab'}>{t}</button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="settings-card">
          <h2 className="settings-h2">General</h2>
          <div className="settings-grid-2">
            <div className="settings-row"><label className="settings-label">Site Title</label><input value={settings.siteTitle || ''} onChange={(e) => set('siteTitle', e.target.value)} className="settings-input" placeholder="Sahab Uddin Mintu" /></div>
            <div className="settings-row"><label className="settings-label">Contact Email</label><input type="email" value={settings.contactEmail || ''} onChange={(e) => set('contactEmail', e.target.value)} className="settings-input" /></div>
            <div className="settings-row"><label className="settings-label">Contact Phone</label><input value={settings.contactPhone || ''} onChange={(e) => set('contactPhone', e.target.value)} className="settings-input" /></div>
          </div>
          <div className="settings-row"><label className="settings-label">Site Description</label><textarea value={settings.siteDescription || ''} onChange={(e) => set('siteDescription', e.target.value)} className="settings-input settings-textarea-90" /></div>
          <div className="settings-grid-2">
            <ImageUpload label="Favicon" value={settings.favicon || ''} onChange={(url) => set('favicon', url)} folder="sahab-portfolio/settings" />
            <ImageUpload label="Logo (Navbar)" value={settings.logo || ''} onChange={(url) => set('logo', url)} folder="sahab-portfolio/settings" />
          </div>
        </div>
      )}

      {tab === 'Profile' && (
        <>
          <div className="settings-card">
            <h2 className="settings-h2">Profile</h2>
            <div className="settings-grid-2">
              <div className="settings-row"><label className="settings-label">Full Name</label><input value={settings.name || ''} onChange={(e) => set('name', e.target.value)} className="settings-input" /></div>
              <div className="settings-row"><label className="settings-label">Tagline</label><input value={settings.tagline || ''} onChange={(e) => set('tagline', e.target.value)} className="settings-input" /></div>
              <div className="settings-row"><label className="settings-label">Email</label><input type="email" value={settings.email || ''} onChange={(e) => set('email', e.target.value)} className="settings-input" /></div>
              <div className="settings-row"><label className="settings-label">Phone</label><input value={settings.phone || ''} onChange={(e) => set('phone', e.target.value)} className="settings-input" /></div>
              <div className="settings-row"><label className="settings-label">Location</label><input value={settings.location || ''} onChange={(e) => set('location', e.target.value)} className="settings-input" /></div>
              <div className="settings-row"><label className="settings-label">Company</label><input value={settings.company || ''} onChange={(e) => set('company', e.target.value)} className="settings-input" /></div>
            </div>
            <div className="settings-row"><label className="settings-label">Bio</label><textarea value={settings.bio || ''} onChange={(e) => set('bio', e.target.value)} className="settings-input settings-textarea-100" /></div>
            <div className="settings-checkbox-row">
              <input type="checkbox" id="avail" checked={!!settings.availability} onChange={(e) => set('availability', e.target.checked)} className="settings-checkbox" />
              <label htmlFor="avail" className="settings-checkbox-label">Show "Available for projects" badge</label>
            </div>
            {settings.availability && (
              <div className="settings-row settings-row-mt"><label className="settings-label">Availability Text</label><input value={settings.availabilityText || ''} onChange={(e) => set('availabilityText', e.target.value)} className="settings-input" placeholder="Available for new projects" /></div>
            )}
          </div>

          <div className="settings-card">
            <h2 className="settings-h2">Social Links</h2>
            <p className="settings-hint">Search for a platform, pick it from the list, then paste the profile URL.</p>
            <SocialLinksEditor value={settings.social || []} onChange={(v) => set('social', v)} />
          </div>
        </>
      )}

      {tab === 'Header Menu' && (
        <div className="settings-card">
          <h2 className="settings-h2">Header Menu</h2>
          <p className="settings-hint">Controls the navbar links. Drag the handle to reorder.</p>
          <MenuItemsEditor items={settings.headerMenu || []} onChange={(items) => set('headerMenu', items)} />
        </div>
      )}

      {tab === 'Footer Menu' && (
        <div className="settings-card">
          <h2 className="settings-h2">Footer Menu</h2>
          <p className="settings-hint">Grouped into columns in the footer — Pages, Services, or Legal.</p>
          <MenuItemsEditor items={settings.footerMenu || []} onChange={(items) => set('footerMenu', items)} withColumn />
        </div>
      )}

      {tab === 'Footer' && (
        <div className="settings-card">
          <h2 className="settings-h2">Footer</h2>
          <div className="settings-row"><label className="settings-label">Footer Tagline</label><textarea value={settings.footerTagline || ''} onChange={(e) => set('footerTagline', e.target.value)} className="settings-input settings-textarea-80" placeholder="Building digital products that move businesses forward — one pixel at a time." /></div>
          <div className="settings-row"><label className="settings-label">Copyright Text</label><input value={settings.footerCopyright || ''} onChange={(e) => set('footerCopyright', e.target.value)} className="settings-input" placeholder="© 2026 Sahab Uddin Mintu. All rights reserved." /></div>
        </div>
      )}

      {tab === 'Hero Stats' && (
        <div className="settings-card">
          <h2 className="settings-h2">Hero Stats</h2>
          <p className="settings-hint">These appear in the hero section stats bar. Use "+" suffix for counters like "6+", "100+".</p>
          <div className="settings-stack">
            {(settings.stats || [{ value: '6+', label: 'Years Experience' }, { value: '100+', label: 'Projects Shipped' }, { value: '60+', label: 'Happy Clients' }, { value: '5', label: 'CMS Platforms' }]).map((st, i) => (
              <div key={i} className="settings-stat-row">
                <input value={st.value} onChange={(e) => { const arr = [...(settings.stats || [])]; arr[i] = { ...arr[i], value: e.target.value }; set('stats', arr) }} className="settings-input" placeholder="100+" />
                <input value={st.label} onChange={(e) => { const arr = [...(settings.stats || [])]; arr[i] = { ...arr[i], label: e.target.value }; set('stats', arr) }} className="settings-input" placeholder="Projects Shipped" />
                <button type="button" onClick={() => set('stats', (settings.stats || []).filter((_: any, j: number) => j !== i))} className="settings-remove-btn">×</button>
              </div>
            ))}
            <button type="button" onClick={() => set('stats', [...(settings.stats || []), { value: '', label: '' }])} className="settings-add-btn">
              + Add Stat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
