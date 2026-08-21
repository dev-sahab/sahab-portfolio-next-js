'use client'
import { useEffect, useState } from 'react'
import { ROLES } from '@/lib/permissions'
import type { User } from '@/types'
import '@/styles/components/dashboard/AddUserModal.scss'

interface Props {
  onClose: () => void
  onAdded: (user: User) => void
}

export default function AddUserModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<User['role']>('editor')
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
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.error || 'Something went wrong'); return }
    onAdded(data.data)
    onClose()
  }

  const selected = ROLES.find((r) => r.value === role)

  return (
    <div onClick={onClose} className="aum-overlay">
      <div onClick={(e) => e.stopPropagation()} className="aum-modal">
        <div className="aum-header">
          <h2 className="aum-title">Add User</h2>
          <button type="button" onClick={onClose} className="aum-close-btn" aria-label="Close">×</button>
        </div>

        <form onSubmit={submit} className="aum-form">
          {error && <p className="aum-error">{error}</p>}

          <div className="aum-field">
            <label className="aum-label">Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="form-input" />
          </div>

          <div className="aum-field">
            <label className="aum-label">Email *</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" />
          </div>

          <div className="aum-field">
            <label className="aum-label">Password *</label>
            <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" />
            <p className="aum-hint">At least 8 characters.</p>
          </div>

          <div className="aum-field">
            <label className="aum-label">Role *</label>
            <select value={role} onChange={(e) => setRole(e.target.value as User['role'])} className="form-input">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {selected && <p className="aum-hint">{selected.description}</p>}
          </div>

          <div className="aum-actions">
            <button type="submit" disabled={loading} className="aum-submit-btn">
              {loading ? 'Creating…' : 'Create User'}
            </button>
            <button type="button" onClick={onClose} className="aum-cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
