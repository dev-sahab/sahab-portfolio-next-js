'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'

const S = {
  lbl: { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 6 },
  inp: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 14px', color: '#f0ede6', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  row: { marginBottom: 20 },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 } as React.CSSProperties,
}

export interface Field {
  name: string; label: string
  type?: 'text'|'textarea'|'select'|'checkbox'|'tags'|'number'|'url'|'email'|'image'
  options?: string[]; required?: boolean; placeholder?: string; imageFolder?: string
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
    setLoading(true); setError('')
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
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select></>
            ) : f.type === 'checkbox' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!values[f.name]} onChange={e => set(f.name, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#b8ff4f' }} />
                <span style={{ fontSize: 14, color: '#9a9a9a' }}>{f.label}</span>
              </label>
            ) : f.type === 'tags' ? (
              <><label style={S.lbl}>{f.label}</label>
              <input type="text" placeholder={f.placeholder || 'Type and press Enter'}  style={S.inp}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return; e.preventDefault()
                  const v = (e.target as HTMLInputElement).value.trim()
                  if (v) { set(f.name, [...(values[f.name] || []), v]); (e.target as HTMLInputElement).value = '' }
                }} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {(values[f.name] || []).map((tag: string, i: number) => (
                  <span key={i} onClick={() => set(f.name, values[f.name].filter((_: any, j: number) => j !== i))}
                    style={{ padding: '3px 10px', background: 'rgba(184,255,79,.1)', border: '1px solid rgba(184,255,79,.2)', borderRadius: 100, fontSize: 11, color: '#b8ff4f', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>
                    {tag} ×
                  </span>
                ))}
              </div></>
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
