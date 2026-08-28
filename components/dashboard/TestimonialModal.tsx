'use client'
import { useEffect, useState } from 'react'
import type { Testimonial } from '@/types'
import '@/styles/components/dashboard/TestimonialModal.scss'

interface Props {
  testimonial?: Testimonial
  onClose: () => void
  onSaved: (t: Testimonial) => void
}

export default function TestimonialModal({ testimonial, onClose, onSaved }: Props) {
  const isEdit = !!testimonial
  const [name, setName] = useState(testimonial?.name || '')
  const [role, setRole] = useState(testimonial?.role || '')
  const [company, setCompany] = useState(testimonial?.company || '')
  const [content, setContent] = useState(testimonial?.content || '')
  const [rating, setRating] = useState(testimonial?.rating ?? 5)
  const [featured, setFeatured] = useState(testimonial?.featured ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const body = { name, role, company, content, rating, featured }
    const res = await fetch(isEdit ? `/api/testimonials/${testimonial!._id}` : '/api/testimonials', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.error || 'Something went wrong'); return }
    onSaved(data.data)
    onClose()
  }

  return (
    <div onClick={onClose} className="tm-overlay">
      <div onClick={(e) => e.stopPropagation()} className="tm-modal">
        <div className="tm-header">
          <h2 className="tm-title">{isEdit ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button type="button" onClick={onClose} className="tm-close-btn" aria-label="Close">×</button>
        </div>

        <form onSubmit={submit} className="tm-form">
          {error && <p className="tm-error">{error}</p>}

          <div className="tm-grid">
            <div className="tm-field">
              <label className="tm-label">Name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
            </div>
            <div className="tm-field">
              <label className="tm-label">Role *</label>
              <input required value={role} onChange={(e) => setRole(e.target.value)} className="form-input" />
            </div>
            <div className="tm-field">
              <label className="tm-label">Company</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="form-input" />
            </div>
            <div className="tm-field">
              <label className="tm-label">Rating (1-5)</label>
              <input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-input" />
            </div>
          </div>

          <div className="tm-field">
            <label className="tm-label">Testimonial Content *</label>
            <textarea required value={content} onChange={(e) => setContent(e.target.value)} className="form-input tm-textarea" />
          </div>

          <label className="tm-checkbox-label">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="tm-checkbox" />
            Featured
          </label>

          <div className="tm-actions">
            <button type="submit" disabled={loading} className="tm-submit-btn">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="tm-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
