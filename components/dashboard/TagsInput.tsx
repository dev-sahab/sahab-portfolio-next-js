'use client'
import { useState, useRef } from 'react'
import '@/styles/components/dashboard/TagsInput.scss'

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
    <div className="combobox-wrap">
      <label className="combobox-label">{label}</label>
      <input
        type="text"
        value={query}
        placeholder={placeholder || 'Type and press Enter'}
        className="combobox-input"
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimeout.current = setTimeout(() => setOpen(false), 150) }}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); add(query) }
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && (filtered.length > 0 || showCreate) && (
        <div className="combobox-dropdown">
          {filtered.map(s => (
            <div
              key={s}
              onMouseDown={e => { e.preventDefault(); if (blurTimeout.current) clearTimeout(blurTimeout.current); add(s) }}
              className="combobox-option"
            >
              {s}
            </div>
          ))}
          {showCreate && (
            <div
              onMouseDown={e => { e.preventDefault(); if (blurTimeout.current) clearTimeout(blurTimeout.current); add(query) }}
              className={`combobox-option-create ${filtered.length ? 'is-divided' : ''}`}
            >
              + Create &ldquo;{query.trim()}&rdquo;
            </div>
          )}
        </div>
      )}
      <div className="tag-chip-list">
        {value.map((tag, i) => (
          <span key={i} onClick={() => onChange(value.filter((_, j) => j !== i))} className="tag-chip">
            {tag} ×
          </span>
        ))}
      </div>
    </div>
  )
}
