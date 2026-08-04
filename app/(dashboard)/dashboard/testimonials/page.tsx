'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import PageHeader from '@/components/dashboard/PageHeader'
import type { Testimonial } from '@/types'

function TestimonialCard({ t, onDelete, onToggle }: { t: Testimonial; onDelete: () => void; onToggle: () => void }) {
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 16, color: '#fbbf24', flexShrink: 0 }}>
          {t.avatar ? (
            <Image src={t.avatar} alt={t.name} fill sizes="40px" style={{ objectFit: 'cover' }} />
          ) : t.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#f0ede6' }}>{t.name}</span>
            <span style={{ fontSize: 11, color: '#555', fontFamily: 'var(--f-m)' }}>{t.role}{t.company ? `, ${t.company}` : ''}</span>
            <span style={{ fontSize: 12, color: '#fbbf24' }}>{'★'.repeat(t.rating)}</span>
          </div>
          <p style={{ fontSize: 13, color: '#9a9a9a', lineHeight: 1.6, fontStyle: 'italic' }}>"{t.content.slice(0, 120)}{t.content.length > 120 ? '…' : ''}"</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={onToggle} style={{ padding: '6px 12px', background: t.featured ? 'rgba(184,255,79,.12)' : '#222', border: `1px solid ${t.featured ? '#b8ff4f33' : '#2a2a2a'}`, borderRadius: 6, fontSize: 11, color: t.featured ? '#b8ff4f' : '#9a9a9a', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>
            {t.featured ? 'Featured' : 'Feature'}
          </button>
          <button type="button" onClick={onDelete} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #ef444433', borderRadius: 6, fontSize: 11, color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

function AddForm({ onAdd }: { onAdd: (t: Testimonial) => void }) {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState({ name: '', role: '', company: '', content: '', rating: 5, featured: false, order: 0 })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const res = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
    const data = await res.json()
    if (data.success) { onAdd(data.data); setOpen(false); setV({ name: '', role: '', company: '', content: '', rating: 5, featured: false, order: 0 }) }
    setLoading(false)
  }

  const inp = { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '9px 13px', color: '#f0ede6', fontSize: 13, outline: 'none' } as React.CSSProperties
  const lbl = { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 5 }

  if (!open) return (
    <button type="button" onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#b8ff4f', color: '#0a0a0a', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--f-m)', border: 'none', cursor: 'pointer' }}>
      + Add Testimonial
    </button>
  )

  return (
    <form onSubmit={submit} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0ede6', marginBottom: 16 }}>Add Testimonial</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div><label style={lbl}>Name *</label><input required value={v.name} onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))} style={inp} /></div>
        <div><label style={lbl}>Role *</label><input required value={v.role} onChange={(e) => setV((p) => ({ ...p, role: e.target.value }))} style={inp} /></div>
        <div><label style={lbl}>Company</label><input value={v.company} onChange={(e) => setV((p) => ({ ...p, company: e.target.value }))} style={inp} /></div>
        <div><label style={lbl}>Rating (1-5)</label><input type="number" min={1} max={5} value={v.rating} onChange={(e) => setV((p) => ({ ...p, rating: Number(e.target.value) }))} style={inp} /></div>
      </div>
      <div style={{ marginBottom: 14 }}><label style={lbl}>Testimonial Content *</label><textarea required value={v.content} onChange={(e) => setV((p) => ({ ...p, content: e.target.value }))} style={{ ...inp, minHeight: 100, resize: 'vertical' }} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#9a9a9a' }}>
          <input type="checkbox" checked={v.featured} onChange={(e) => setV((p) => ({ ...p, featured: e.target.checked }))} style={{ accentColor: '#b8ff4f' }} />
          Featured
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" disabled={loading} style={{ background: '#b8ff4f', color: '#0a0a0a', border: 'none', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f-m)' }}>{loading ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9a9a9a', padding: '9px 20px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--f-m)' }}>Cancel</button>
      </div>
    </form>
  )
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/testimonials').then((r) => r.json()).then((d) => { if (d.success) setItems(d.data); setLoading(false) })
  }, [])

  const del = async (id: string) => {
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    setItems((p) => p.filter((t) => t._id !== id))
  }

  const toggle = async (t: Testimonial) => {
    const res = await fetch(`/api/testimonials/${t._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !t.featured }) })
    const data = await res.json()
    if (data.success) setItems((p) => p.map((x) => x._id === t._id ? { ...x, featured: !x.featured } : x))
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em', marginBottom: 4 }}>Testimonials</h1>
          <p style={{ fontSize: 14, color: '#9a9a9a' }}>{items.length} total</p>
        </div>
      </div>
      <AddForm onAdd={(t) => setItems((p) => [t, ...p])} />
      {loading ? <p style={{ color: '#555' }}>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {items.map((t) => <TestimonialCard key={t._id} t={t} onDelete={() => del(t._id!)} onToggle={() => toggle(t)} />)}
        </div>
      )}
    </div>
  )
}
