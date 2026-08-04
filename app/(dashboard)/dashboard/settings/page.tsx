'use client'
import { useState, useEffect } from 'react'
import type { SiteSettings } from '@/types'

const S = {
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 16 } as React.CSSProperties,
  label: { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 6 },
  input: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 13px', color: '#f0ede6', fontSize: 14, outline: 'none' },
  row: { marginBottom: 16 },
  h2: { fontSize: 16, fontWeight: 700, color: '#f0ede6', fontFamily: 'var(--f-d)', marginBottom: 18 },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      if (d.success) setSettings(d.data)
      setLoading(false)
    })
  }, [])

  const set = (k: string, v: any) => setSettings((p) => ({ ...p, [k]: v }))
  const setNested = (parent: string, k: string, v: any) => setSettings((p) => ({ ...p, [parent]: { ...(p as any)[parent], [k]: v } }))

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
    const data = await res.json()
    if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 32, color: '#555' }}>Loading settings…</div>

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em' }}>Site Settings</h1>
        <button type="button" onClick={handleSave} disabled={saving} style={{ background: saving ? '#555' : '#b8ff4f', color: '#0a0a0a', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f-m)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Profile */}
      <div style={S.card}>
        <h2 style={S.h2}>Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={S.row}><label style={S.label}>Full Name</label><input value={settings.name || ''} onChange={(e) => set('name', e.target.value)} style={S.input} /></div>
          <div style={S.row}><label style={S.label}>Tagline</label><input value={settings.tagline || ''} onChange={(e) => set('tagline', e.target.value)} style={S.input} /></div>
          <div style={S.row}><label style={S.label}>Email</label><input type="email" value={settings.email || ''} onChange={(e) => set('email', e.target.value)} style={S.input} /></div>
          <div style={S.row}><label style={S.label}>Phone</label><input value={settings.phone || ''} onChange={(e) => set('phone', e.target.value)} style={S.input} /></div>
          <div style={S.row}><label style={S.label}>Location</label><input value={settings.location || ''} onChange={(e) => set('location', e.target.value)} style={S.input} /></div>
          <div style={S.row}><label style={S.label}>Company</label><input value={settings.company || ''} onChange={(e) => set('company', e.target.value)} style={S.input} /></div>
        </div>
        <div style={S.row}><label style={S.label}>Bio</label><textarea value={settings.bio || ''} onChange={(e) => set('bio', e.target.value)} style={{ ...S.input, minHeight: 100, resize: 'vertical' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="avail" checked={!!settings.availability} onChange={(e) => set('availability', e.target.checked)} style={{ accentColor: '#b8ff4f', width: 16, height: 16 }} />
          <label htmlFor="avail" style={{ fontSize: 14, color: '#9a9a9a', cursor: 'pointer' }}>Show "Available for projects" badge</label>
        </div>
        {settings.availability && (
          <div style={{ ...S.row, marginTop: 12 }}><label style={S.label}>Availability Text</label><input value={settings.availabilityText || ''} onChange={(e) => set('availabilityText', e.target.value)} style={S.input} placeholder="Available for new projects" /></div>
        )}
      </div>

      {/* Social */}
      <div style={S.card}>
        <h2 style={S.h2}>Social Links</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {(['github','linkedin','twitter','upwork'] as const).map((k) => (
            <div key={k} style={S.row}>
              <label style={S.label}>{k.charAt(0).toUpperCase() + k.slice(1)}</label>
              <input value={(settings.social as any)?.[k] || ''} onChange={(e) => setNested('social', k, e.target.value)} style={S.input} placeholder={`https://${k}.com/...`} />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={S.card}>
        <h2 style={S.h2}>Hero Stats</h2>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>These appear in the hero section stats bar. Use "+" suffix for counters like "6+", "100+".</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(settings.stats || [{ value: '6+', label: 'Years Experience' }, { value: '100+', label: 'Projects Shipped' }, { value: '60+', label: 'Happy Clients' }, { value: '5', label: 'CMS Platforms' }]).map((st, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, alignItems: 'center' }}>
              <input value={st.value} onChange={(e) => { const arr = [...(settings.stats || [])]; arr[i] = { ...arr[i], value: e.target.value }; set('stats', arr) }} style={S.input} placeholder="100+" />
              <input value={st.label} onChange={(e) => { const arr = [...(settings.stats || [])]; arr[i] = { ...arr[i], label: e.target.value }; set('stats', arr) }} style={S.input} placeholder="Projects Shipped" />
              <button type="button" onClick={() => set('stats', (settings.stats || []).filter((_: any, j: number) => j !== i))} style={{ padding: '9px 12px', background: 'transparent', border: '1px solid #ef444433', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>×</button>
            </div>
          ))}
          <button type="button" onClick={() => set('stats', [...(settings.stats || []), { value: '', label: '' }])} style={{ background: 'transparent', border: '1px dashed #2a2a2a', borderRadius: 6, padding: '8px', color: '#555', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--f-m)' }}>
            + Add Stat
          </button>
        </div>
      </div>
    </div>
  )
}
