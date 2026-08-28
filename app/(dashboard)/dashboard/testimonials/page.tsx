'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import TestimonialModal from '@/components/dashboard/TestimonialModal'
import type { Testimonial } from '@/types'
import '@/styles/pages/(dashboard)/dashboard/testimonials/page.scss'

function TestimonialCard({ t, onDelete, onToggle, onEdit }: { t: Testimonial; onDelete: () => void; onToggle: () => void; onEdit: () => void }) {
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
          <button type="button" onClick={onEdit} className="testimonial-edit-btn">Edit</button>
          <button type="button" onClick={onToggle} className={`testimonial-feature-btn${t.featured ? ' is-featured' : ''}`}>
            {t.featured ? 'Featured' : 'Feature'}
          </button>
          <button type="button" onClick={onDelete} className="testimonial-delete-btn">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | undefined>(undefined)

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

  const openAdd = () => { setEditing(undefined); setModalOpen(true) }
  const openEdit = (t: Testimonial) => { setEditing(t); setModalOpen(true) }

  const saved = (t: Testimonial) => {
    setItems((p) => (editing ? p.map((x) => x._id === t._id ? t : x) : [t, ...p]))
  }

  return (
    <div className="testimonials-page">
      <div className="testimonials-header">
        <div>
          <h1 className="testimonials-title">Testimonials</h1>
          <p className="testimonials-subtitle">{items.length} total</p>
        </div>
      </div>
      <button type="button" onClick={openAdd} className="testimonial-add-btn">+ Add Testimonial</button>
      {loading ? <p className="testimonials-loading">Loading…</p> : (
        <div className="testimonials-list">
          {items.map((t) => (
            <TestimonialCard
              key={t._id}
              t={t}
              onDelete={() => del(t._id!)}
              onToggle={() => toggle(t)}
              onEdit={() => openEdit(t)}
            />
          ))}
        </div>
      )}
      {modalOpen && (
        <TestimonialModal
          testimonial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={saved}
        />
      )}
    </div>
  )
}
