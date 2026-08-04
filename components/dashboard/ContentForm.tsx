'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import GalleryUpload from './GalleryUpload'
import TagsInput from './TagsInput'
import CategoryCombobox from './CategoryCombobox'
import RichEditor from './RichEditor'
import { slugify } from '@/lib/utils'

const S = {
  lbl: { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 6 },
  inp: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '10px 14px', color: '#f0ede6', fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  row: { marginBottom: 20 },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 } as React.CSSProperties,
  boxTitle: { fontSize: 13, fontWeight: 700, color: '#f0ede6', marginBottom: 14, fontFamily: 'var(--f-d)' } as React.CSSProperties,
}

export interface Field {
  name: string; label: string
  type?: 'text'|'textarea'|'select'|'checkbox'|'tags'|'number'|'url'|'email'|'image'|'category'|'richtext'|'gallery'
  options?: string[] | { value: string; label: string }[]; required?: boolean; placeholder?: string; imageFolder?: string
  suggestions?: string[]
  categories?: { _id: string; name: string; parent?: string | null }[]
  taxonomyType?: 'project' | 'blog'
  section?: 'main' | 'side'
  sideGroup?: string
}

interface Props {
  title: string; endpoint: string; method?: 'POST'|'PUT'
  fields: Field[]; defaults?: Record<string, any>; redirectTo: string
}

export default function ContentForm({ title, endpoint, method = 'POST', fields, defaults = {}, redirectTo }: Props) {
  const router = useRouter()
  const isEdit = method === 'PUT'
  const [values,  setValues]  = useState<Record<string, any>>(defaults)
  const [loading, setLoading] = useState(false)
  const [stage,   setStage]   = useState<'uploading' | 'saving' | null>(null)
  const [error,   setError]   = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugEditing, setSlugEditing] = useState(false)
  const [confirmingSlugEdit, setConfirmingSlugEdit] = useState(false)
  const originalSlug = useRef(defaults.slug || '')

  // Image changes are staged locally and only actually uploaded/deleted once the
  // form is saved — so removing or replacing a published image never destroys it
  // if the user cancels or navigates away without saving.
  const pendingUploads = useRef<Map<string, File>>(new Map())
  const pendingDeletions = useRef<Set<string>>(new Set())

  const set = (k: string, v: any) => setValues(p => ({ ...p, [k]: v }))

  const registerPendingUpload = (blobUrl: string, file: File) => {
    pendingUploads.current.set(blobUrl, file)
  }

  const registerPendingDeletion = (url: string) => {
    // Never-uploaded staged file — just drop it, nothing to delete server-side.
    if (pendingUploads.current.has(url)) { pendingUploads.current.delete(url); return }
    pendingDeletions.current.add(url)
  }

  const uploadStagedFile = async (file: File, folder?: string) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder || 'sahab-portfolio')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Image upload failed')
    return data.data.url as string
  }

  const hasSlugField = fields.some(f => f.name === 'slug')

  const handleTitleChange = (v: string) => {
    // Editing an existing item never touches the slug automatically —
    // the slug is a stable URL that shouldn't shift under a live post.
    if (isEdit) { set('title', v); return }
    setValues(p => {
      const next: Record<string, any> = { ...p, title: v }
      if (hasSlugField && (!p.slug || !slugManuallyEdited)) next.slug = slugify(v)
      return next
    })
  }

  const handleSlugChange = (v: string) => {
    setSlugManuallyEdited(true)
    set('slug', v)
  }

  // Edit mode: only offer a slug once the user has explicitly cleared it,
  // and only after they confirm — mirrors WordPress's "change permalink" flow.
  const slugSuggestion = isEdit && hasSlugField && !values.slug && values.title ? slugify(values.title) : ''

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
      // Resolve any staged (not-yet-uploaded) images to real Cloudinary URLs first.
      setStage('uploading')
      const resolved: Record<string, any> = { ...values }
      for (const f of fields) {
        if (f.type === 'image') {
          const v = resolved[f.name]
          if (typeof v === 'string' && v.startsWith('blob:')) {
            const file = pendingUploads.current.get(v)
            if (file) {
              resolved[f.name] = await uploadStagedFile(file, f.imageFolder)
              pendingUploads.current.delete(v)
            }
          }
        }
        if (f.type === 'gallery' && Array.isArray(resolved[f.name])) {
          const next: string[] = []
          for (const item of resolved[f.name] as string[]) {
            if (typeof item === 'string' && item.startsWith('blob:')) {
              const file = pendingUploads.current.get(item)
              if (file) {
                next.push(await uploadStagedFile(file, f.imageFolder))
                pendingUploads.current.delete(item)
                continue
              }
            }
            next.push(item)
          }
          resolved[f.name] = next
        }
      }
      setValues(resolved)

      setStage('saving')
      const res  = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resolved) })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed')

      // Only now that the post actually saved do we destroy anything the user removed.
      const toDelete = Array.from(pendingDeletions.current)
      pendingDeletions.current.clear()
      await Promise.all(toDelete.map(url =>
        fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).catch(() => {})
      ))

      router.push(redirectTo); router.refresh()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
      setStage(null)
    }
  }

  const renderField = (f: Field) => {
    if (f.type === 'image') {
      return <ImageUpload label={f.label} value={values[f.name] || ''} onChange={url => set(f.name, url)} folder={f.imageFolder}
        onStageUpload={registerPendingUpload} onStageDelete={registerPendingDeletion} />
    }
    if (f.type === 'gallery') {
      return <GalleryUpload label={f.label} value={values[f.name] || []} onChange={v => set(f.name, v)} folder={f.imageFolder}
        onStageUpload={registerPendingUpload} onStageDelete={registerPendingDeletion} />
    }
    if (f.type === 'richtext') {
      return <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
        <RichEditor value={values[f.name] || ''} onChange={v => set(f.name, v)} placeholder={f.placeholder} /></>
    }
    if (f.type === 'textarea') {
      return <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
        <textarea value={values[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder}
          style={{ ...S.inp, minHeight: 200, resize: 'vertical', lineHeight: 1.6 }} /></>
    }
    if (f.type === 'select') {
      return <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
        <select value={values[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} style={S.inp}>
          <option value="">Select…</option>
          {f.options?.map(o => typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select></>
    }
    if (f.type === 'category') {
      return <CategoryCombobox
        label={f.label}
        value={values[f.name] || ''}
        onChange={v => set(f.name, v)}
        categories={f.categories || []}
        taxonomyType={f.taxonomyType || 'project'}
        required={f.required}
      />
    }
    if (f.type === 'checkbox') {
      return <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={!!values[f.name]} onChange={e => set(f.name, e.target.checked)} style={{ width: 16, height: 16, accentColor: '#b8ff4f' }} />
        <span style={{ fontSize: 14, color: '#9a9a9a' }}>{f.label}</span>
      </label>
    }
    if (f.type === 'tags') {
      return <TagsInput
        label={f.label}
        value={values[f.name] || []}
        onChange={v => set(f.name, v)}
        suggestions={f.suggestions}
        placeholder={f.placeholder}
      />
    }
    if (f.type === 'number') {
      return <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
        <input type="number" value={values[f.name] ?? ''} onChange={e => set(f.name, Number(e.target.value))} required={f.required} style={S.inp} /></>
    }
    if (f.name === 'slug' && isEdit) {
      return (
        <>
          <label style={S.lbl}>{f.label}{f.required && ' *'}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={values.slug || ''}
              disabled={!slugEditing}
              onChange={e => handleSlugChange(e.target.value)}
              required={f.required}
              placeholder={f.placeholder}
              style={{ ...S.inp, opacity: slugEditing ? 1 : 0.55, cursor: slugEditing ? 'text' : 'not-allowed' }}
            />
            {slugEditing ? (
              <button type="button" onClick={() => { setSlugEditing(false); set('slug', originalSlug.current) }}
                style={{ background: 'transparent', color: '#9a9a9a', border: '1px solid #2a2a2a', borderRadius: 6, padding: '0 16px', fontSize: 12, fontFamily: 'var(--f-m)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Cancel
              </button>
            ) : !confirmingSlugEdit ? (
              <button type="button" onClick={() => setConfirmingSlugEdit(true)}
                style={{ background: 'transparent', color: '#b8ff4f', border: '1px solid rgba(184,255,79,.3)', borderRadius: 6, padding: '0 16px', fontSize: 12, fontFamily: 'var(--f-m)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Edit
              </button>
            ) : null}
          </div>
          {confirmingSlugEdit && !slugEditing && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#9a9a9a' }}>
                Changing the slug may break existing links to this page. Continue?
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => { setSlugEditing(true); setConfirmingSlugEdit(false) }}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-m)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Yes, edit slug
                </button>
                <button type="button" onClick={() => setConfirmingSlugEdit(false)}
                  style={{ background: 'transparent', color: '#9a9a9a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '5px 12px', fontSize: 11, fontFamily: 'var(--f-m)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {slugEditing && slugSuggestion && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(184,255,79,.06)', border: '1px solid rgba(184,255,79,.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#9a9a9a' }}>
                Slug is empty — generate from title: <strong style={{ color: '#f0ede6' }}>{slugSuggestion}</strong>?
              </span>
              <button type="button" onClick={() => { setSlugManuallyEdited(true); set('slug', slugSuggestion) }}
                style={{ background: '#b8ff4f', color: '#0a0a0a', border: 'none', borderRadius: 4, padding: '5px 12px', fontSize: 11, fontWeight: 700, fontFamily: 'var(--f-m)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Use this slug
              </button>
            </div>
          )}
        </>
      )
    }
    return <><label style={S.lbl}>{f.label}{f.required && ' *'}</label>
      <input type={f.type || 'text'} value={values[f.name] || ''}
        onChange={e => {
          if (f.name === 'title') return handleTitleChange(e.target.value)
          if (f.name === 'slug') return handleSlugChange(e.target.value)
          set(f.name, e.target.value)
        }}
        required={f.required} placeholder={f.placeholder} style={S.inp} /></>
  }

  const mainFields = fields.filter(f => (f.section ?? 'main') === 'main')
  const sideFields = fields.filter(f => f.section === 'side')
  const publishFields = sideFields.filter(f => f.type === 'checkbox')
  const boxFields = sideFields.filter(f => f.type !== 'checkbox')

  const sideBoxes: { title: string; fields: Field[] }[] = []
  for (const f of boxFields) {
    const boxTitle = f.sideGroup || f.label
    let box = sideBoxes.find(b => b.title === boxTitle)
    if (!box) { box = { title: boxTitle, fields: [] }; sideBoxes.push(box) }
    box.fields.push(f)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="cf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* MAIN COLUMN */}
        <div style={S.card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f0ede6', marginBottom: 20, fontFamily: 'var(--f-d)' }}>{title}</h2>

          {error && (
            <div style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              {error}
            </div>
          )}

          {mainFields.map(f => (
            <div key={f.name} style={S.row}>
              {renderField(f)}
            </div>
          ))}
        </div>

        {/* SIDEBAR COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={S.card}>
            <h3 style={S.boxTitle}>Publish</h3>
            {publishFields.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {publishFields.map(f => <div key={f.name}>{renderField(f)}</div>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={loading}
                style={{ flex: 1, background: '#b8ff4f', color: '#0a0a0a', border: 'none', padding: '11px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-m)', cursor: 'pointer', opacity: loading ? .6 : 1 }}>
                {stage === 'uploading' ? 'Uploading images…' : stage === 'saving' ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => router.back()}
                style={{ background: 'transparent', color: '#9a9a9a', border: '1px solid #2a2a2a', padding: '11px 16px', borderRadius: 8, fontSize: 13, fontFamily: 'var(--f-m)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>

          {sideBoxes.map(box => (
            <div key={box.title} style={S.card}>
              <h3 style={S.boxTitle}>{box.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {box.fields.map(f => <div key={f.name}>{renderField(f)}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
