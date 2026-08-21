'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import PageHeader from '@/components/dashboard/PageHeader'
import type { Testimonial } from '@/types'
import '@/styles/pages/(dashboard)/dashboard/testimonials/page.scss'

function TestimonialCard({ t, onDelete, onToggle }: { t: Testimonial; onDelete: () => void; onToggle: () => void }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-card-row">
        <div className="testimonial-avatar">
          {t.avatar ? (
            <Image src={t.avatar} alt={t.name} fill sizes="40px" className="testimonial-avatar-img" />
          ) : t.name[0]}
        </div>
        <div className="testimonial-content">
          <div className="testimonial-header">
            <span className="testimonial-name">{t.name}</span>
            <span className="testimonial-role">{t.role}{t.company ? `, ${t.company}` : ''}</span>
            <span className="testimonial-rating">{'★'.repeat(t.rating)}</span>
          </div>
          <p className="testimonial-text">"{t.content.slice(0, 120)}{t.content.length > 120 ? '…' : ''}"</p>
        </div>
        <div className="testimonial-actions">
          <button type="button" onClick={onToggle} className={`testimonial-feature-btn${t.featured ? ' is-featured' : ''}`}>
            {t.featured ? 'Featured' : 'Feature'}
          </button>
          <button type="button" onClick={onDelete} className="testimonial-delete-btn">Delete</button>
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

  if (!open) return (
    <button type="button" onClick={() => setOpen(true)} className="testimonial-add-btn">
      + Add Testimonial
    </button>
  )

  return (
    <form onSubmit={submit} className="testimonial-form">
      <h3 className="testimonial-form-title">Add Testimonial</h3>
      <div className="testimonial-form-grid">
        <div><label className="testimonial-form-label">Name *</label><input required value={v.name} onChange={(e) => setV((p) => ({ ...p, name: e.target.value }))} className="testimonial-form-input" /></div>
        <div><label className="testimonial-form-label">Role *</label><input required value={v.role} onChange={(e) => setV((p) => ({ ...p, role: e.target.value }))} className="testimonial-form-input" /></div>
        <div><label className="testimonial-form-label">Company</label><input value={v.company} onChange={(e) => setV((p) => ({ ...p, company: e.target.value }))} className="testimonial-form-input" /></div>
        <div><label className="testimonial-form-label">Rating (1-5)</label><input type="number" min={1} max={5} value={v.rating} onChange={(e) => setV((p) => ({ ...p, rating: Number(e.target.value) }))} className="testimonial-form-input" /></div>
      </div>
      <div className="testimonial-form-field"><label className="testimonial-form-label">Testimonial Content *</label><textarea required value={v.content} onChange={(e) => setV((p) => ({ ...p, content: e.target.value }))} className="testimonial-form-input testimonial-form-textarea" /></div>
      <div className="testimonial-form-checkbox-row">
        <label className="testimonial-form-checkbox-label">
          <input type="checkbox" checked={v.featured} onChange={(e) => setV((p) => ({ ...p, featured: e.target.checked }))} className="testimonial-form-checkbox" />
          Featured
        </label>
      </div>
      <div className="testimonial-form-actions">
        <button type="submit" disabled={loading} className="testimonial-form-submit">{loading ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={() => setOpen(false)} className="testimonial-form-cancel">Cancel</button>
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
    <div className="testimonials-page">
      <div className="testimonials-header">
        <div>
          <h1 className="testimonials-title">Testimonials</h1>
          <p className="testimonials-subtitle">{items.length} total</p>
        </div>
      </div>
      <AddForm onAdd={(t) => setItems((p) => [t, ...p])} />
      {loading ? <p className="testimonials-loading">Loading…</p> : (
        <div className="testimonials-list">
          {items.map((t) => <TestimonialCard key={t._id} t={t} onDelete={() => del(t._id!)} onToggle={() => toggle(t)} />)}
        </div>
      )}
    </div>
  )
}
