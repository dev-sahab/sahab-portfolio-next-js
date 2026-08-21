'use client'
import { useRef, useState } from 'react'
import { SOCIAL_PLATFORMS, getSocialPlatform } from '@/components/site/socialIcons'
import type { SocialLink } from '@/types'
import '@/styles/components/dashboard/SocialLinksEditor.scss'

function PlatformPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const current = value ? getSocialPlatform(value) : null
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? SOCIAL_PLATFORMS.filter((p) => p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
    : SOCIAL_PLATFORMS

  const select = (key: string) => {
    onChange(key)
    setQuery('')
    setOpen(false)
  }

  const Icon = current?.icon

  return (
    <div className="combobox-wrap">
      <div className="social-input social-picker-field">
        {Icon && <Icon size={16} />}
        <input
          type="text"
          value={open ? query : current?.label || ''}
          placeholder="Search platform…"
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => { blurTimeout.current = setTimeout(() => setOpen(false), 150) }}
          className="social-picker-input"
        />
      </div>
      {open && (
        <div className="combobox-dropdown">
          {filtered.length === 0 && (
            <div className="combobox-empty">No matching platform</div>
          )}
          {filtered.map((p) => {
            const PIcon = p.icon
            return (
              <div
                key={p.key}
                onMouseDown={(e) => { e.preventDefault(); if (blurTimeout.current) clearTimeout(blurTimeout.current); select(p.key) }}
                className="combobox-option"
              >
                <PIcon size={15} />
                {p.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SocialLinksEditor({ value, onChange }: { value: SocialLink[]; onChange: (v: SocialLink[]) => void }) {
  const update = (i: number, patch: Partial<SocialLink>) => {
    const next = [...value]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i))
  const add = () => onChange([...value, { platform: '', url: '' }])

  return (
    <div className="social-links-list">
      {value.map((item, i) => (
        <div key={i} className="social-link-row">
          <PlatformPicker value={item.platform} onChange={(key) => update(i, { platform: key })} />
          <input
            value={item.url}
            onChange={(e) => update(i, { url: e.target.value })}
            className="social-input"
            placeholder={item.platform ? getSocialPlatform(item.platform).placeholder : 'Select a platform first'}
          />
          <button type="button" onClick={() => remove(i)} className="social-remove-btn">×</button>
        </div>
      ))}
      <button type="button" onClick={add} className="social-add-btn">
        + Add Social Link
      </button>
    </div>
  )
}
