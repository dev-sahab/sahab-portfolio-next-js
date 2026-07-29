'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import TagsInput from './TagsInput'
import CategoryCombobox from './CategoryCombobox'

const S = {
  lbl: { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 6 },
  inp: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 14px', color: '#f0ede6', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  row: { marginBottom: 20 },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 } as React.CSSProperties,
}

export interface Field {
  name: string; label: string
  type?: 'text'|'textarea'|'select'|'checkbox'|'tags'|'number'|'url'|'email'|'image'|'category'
  options?: string[] | { value: string; label: string }[]; required?: boolean; placeholder?: string; imageFolder?: string
  suggestions?: string[]
  categories?: { _id: string; name: string; parent?: string | null }[]
  taxonomyType?: 'project' | 'blog'
}

interface Props {
  title: string; endpoint: string; method?: 'POST'|'PUT'
  fields: Field[]; defaults?: Record<string, any>; redirectTo: string
}

export default function ContentForm({ title, endpoint, method = 'POST', fields, defaults = {}, redirectTo }: Props) {
  const router = useRouter()
  const [values,  setValues]  = useState<Record<string, any>>(defaults)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = (k: string, v: any) => setValues(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    for (const f of fields) {
      if (!f.required) continue
      const v = values[f.name]
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
        setError(`${f.label} is required`)
        return
      }
    }
    setLoading(true)
    try {
      const res  = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed')
      router.push(redirectTo); router.refresh()
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={S.card}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0ede6', marginBottom: 20, fontFamily: 'var(--f-d)' }}>{title}</h2>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        {fields.map(f => (
          <div key={f.name} style={S.row}>
            {f.type === 'image' ? (
              <ImageUpload label={f.label} value={values[f.name] || ''} onChange={url => set(f.name, url)} folder={f.imageFolder} />
            ) : f.type === 'textarea' ? (
              <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
              <textarea value={values[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder}
                style={{ ...S.inp, minHeight: 200, resize: 'vertical', lineHeight: 1.6 }} /></>
            ) : f.type === 'select' ? (
              <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
              <select value={values[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} style={S.inp}>
                <option value="">Select…</option>
                {f.options?.map(o => typeof o === 'string'
                  ? <option key={o} value={o}>{o}</option>
                  : <option key={o.value} value={o.value}>{o.label}</option>)}
              </select></>
            ) : f.type === 'category' ? (
              <CategoryCombobox
                label={f.label}
                value={values[f.name] || ''}
                onChange={v => set(f.name, v)}
                categories={f.categories || []}
                taxonomyType={f.taxonomyType || 'project'}
                required={f.required}
              />
            ) : f.type === 'checkbox' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!values[f.name]} onChange={e => set(f.name, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#b8ff4f' }} />
                <span style={{ fontSize: 14, color: '#9a9a9a' }}>{f.label}</span>
              </label>
            ) : f.type === 'tags' ? (
              <TagsInput
                label={f.label}
                value={values[f.name] || []}
                onChange={v => set(f.name, v)}
                suggestions={f.suggestions}
                placeholder={f.placeholder}
              />
            ) : f.type === 'number' ? (
              <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
              <input type="number" value={values[f.name] ?? ''} onChange={e => set(f.name, Number(e.target.value))} required={f.required} style={S.inp} /></>
            ) : (
              <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
              <input type={f.type || 'text'} value={values[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder} style={S.inp} /></>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" disabled={loading}
            style={{ background: '#b8ff4f', color: '#0a0a0a', border: 'none', padding: '11px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-m)', cursor: 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => router.back()}
            style={{ background: 'transparent', color: '#9a9a9a', border: '1px solid #2a2a2a', padding: '11px 24px', borderRadius: 8, fontSize: 13, fontFamily: 'var(--f-m)', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
