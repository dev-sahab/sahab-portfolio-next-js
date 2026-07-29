'use client'
import { useState, useRef } from 'react'

const S = {
  lbl: { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 6 },
  inp: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 14px', color: '#f0ede6', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
}

interface Props {
  label: string
  value: string[]
  onChange: (v: string[]) => void
  suggestions?: string[]
  placeholder?: string
}

export default function TagsInput({ label, value, onChange, suggestions = [], placeholder }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const add = (v: string) => {
    const trimmed = v.trim()
    if (!trimmed || value.some(t => t.toLowerCase() === trimmed.toLowerCase())) return
    onChange([...value, trimmed])
    setQuery('')
    setOpen(false)
  }

  const q = query.trim().toLowerCase()
  const filtered = q ? suggestions.filter(s => s.toLowerCase().includes(q) && !value.some(t => t.toLowerCase() === s.toLowerCase())) : []
  const exactMatch = suggestions.some(s => s.toLowerCase() === q)
  const showCreate = q.length > 0 && !exactMatch

  return (
    <div style={{ position: 'relative' }}>
      <label style={S.lbl}>{label}</label>
      <input
        type="text"
        value={query}
        placeholder={placeholder || 'Type and press Enter'}
        style={S.inp}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimeout.current = setTimeout(() => setOpen(false), 150) }}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); add(query) }
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && (filtered.length > 0 || showCreate) && (
        <div style={{ position: 'absolute', zIndex: 20, top: '100%', left: 0, right: 0, marginTop: 4, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, maxHeight: 220, overflowY: 'auto' }}>
          {filtered.map(s => (
            <div
              key={s}
              onMouseDown={e => { e.preventDefault(); if (blurTimeout.current) clearTimeout(blurTimeout.current); add(s) }}
              style={{ padding: '8px 14px', fontSize: 13, color: '#f0ede6', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,255,79,.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {s}
            </div>
          ))}
          {showCreate && (
            <div
              onMouseDown={e => { e.preventDefault(); if (blurTimeout.current) clearTimeout(blurTimeout.current); add(query) }}
              style={{ padding: '8px 14px', fontSize: 13, color: '#b8ff4f', cursor: 'pointer', fontFamily: 'var(--f-m)', borderTop: filtered.length ? '1px solid #2a2a2a' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(184,255,79,.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              + Create &ldquo;{query.trim()}&rdquo;
            </div>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {value.map((tag, i) => (
          <span key={i} onClick={() => onChange(value.filter((_, j) => j !== i))}
            style={{ padding: '3px 10px', background: 'rgba(184,255,79,.1)', border: '1px solid rgba(184,255,79,.2)', borderRadius: 100, fontSize: 11, color: '#b8ff4f', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>
            {tag} ×
          </span>
        ))}
      </div>
    </div>
  )
}
