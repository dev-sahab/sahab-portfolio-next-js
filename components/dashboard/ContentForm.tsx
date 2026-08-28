'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from './ImageUpload'
import GalleryUpload from './GalleryUpload'
import TagsInput from './TagsInput'
import CategoryCombobox from './CategoryCombobox'
import RichEditor from './RichEditor'
import { slugify } from '@/lib/utils'
import '@/styles/components/dashboard/ContentForm.scss'

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
      // Offer the form's cover/feature image (if any) as a "Quick Add" pick
      // in the gallery's media picker — see GalleryUpload's featuredImageUrl.
      const imageFieldName = fields.find(other => other.type === 'image')?.name
      const featuredImageUrl = imageFieldName ? values[imageFieldName] : undefined
      return <GalleryUpload label={f.label} value={values[f.name] || []} onChange={v => set(f.name, v)} folder={f.imageFolder}
        onStageUpload={registerPendingUpload} onStageDelete={registerPendingDeletion} featuredImageUrl={featuredImageUrl} />
    }
    if (f.type === 'richtext') {
      return <><label className="cf-lbl">{f.label}{f.required && ' *'}</label>
        <RichEditor value={values[f.name] || ''} onChange={v => set(f.name, v)} placeholder={f.placeholder} /></>
    }
    if (f.type === 'textarea') {
      return <><label className="cf-lbl">{f.label}{f.required && ' *'}</label>
        <textarea value={values[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder}
          className="cf-inp cf-textarea" /></>
    }
    if (f.type === 'select') {
      return <><label className="cf-lbl">{f.label}{f.required && ' *'}</label>
        <select value={values[f.name] || ''} onChange={e => set(f.name, e.target.value)} required={f.required} className="cf-inp">
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
      return <label className="cf-checkbox-label">
        <input type="checkbox" checked={!!values[f.name]} onChange={e => set(f.name, e.target.checked)} className="cf-checkbox-input" />
        <span className="cf-checkbox-text">{f.label}</span>
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
      return <><label className="cf-lbl">{f.label}{f.required && ' *'}</label>
        <input type="number" value={values[f.name] ?? ''} onChange={e => set(f.name, Number(e.target.value))} required={f.required} className="cf-inp" /></>
    }
    if (f.name === 'slug' && isEdit) {
      return (
        <>
          <label className="cf-lbl">{f.label}{f.required && ' *'}</label>
          <div className="cf-slug-row">
            <input
              type="text"
              value={values.slug || ''}
              disabled={!slugEditing}
              onChange={e => handleSlugChange(e.target.value)}
              required={f.required}
              placeholder={f.placeholder}
              className={`cf-inp cf-slug-input ${slugEditing ? '' : 'is-locked'}`}
            />
            {slugEditing ? (
              <button type="button" onClick={() => { setSlugEditing(false); set('slug', originalSlug.current) }}
                className="cf-slug-btn cf-slug-btn-cancel">
                Cancel
              </button>
            ) : !confirmingSlugEdit ? (
              <button type="button" onClick={() => setConfirmingSlugEdit(true)}
                className="cf-slug-btn cf-slug-btn-edit">
                Edit
              </button>
            ) : null}
          </div>
          {confirmingSlugEdit && !slugEditing && (
            <div className="cf-slug-confirm">
              <span className="cf-slug-confirm-text">
                Changing the slug may break existing links to this page. Continue?
              </span>
              <div className="cf-slug-confirm-actions">
                <button type="button" onClick={() => { setSlugEditing(true); setConfirmingSlugEdit(false) }}
                  className="cf-slug-mini-btn cf-slug-btn-danger">
                  Yes, edit slug
                </button>
                <button type="button" onClick={() => setConfirmingSlugEdit(false)}
                  className="cf-slug-mini-btn cf-slug-btn-muted">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {slugEditing && slugSuggestion && (
            <div className="cf-slug-suggest">
              <span className="cf-slug-suggest-text">
                Slug is empty — generate from title: <strong>{slugSuggestion}</strong>?
              </span>
              <button type="button" onClick={() => { setSlugManuallyEdited(true); set('slug', slugSuggestion) }}
                className="cf-slug-mini-btn cf-slug-btn-accent">
                Use this slug
              </button>
            </div>
          )}
        </>
      )
    }
    return <><label className="cf-lbl">{f.label}{f.required && ' *'}</label>
      <input type={f.type || 'text'} value={values[f.name] || ''}
        onChange={e => {
          if (f.name === 'title') return handleTitleChange(e.target.value)
          if (f.name === 'slug') return handleSlugChange(e.target.value)
          set(f.name, e.target.value)
        }}
        required={f.required} placeholder={f.placeholder} className="cf-inp" /></>
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
      <div className="cf-grid">
        {/* MAIN COLUMN */}
        <div className="cf-card">
          <h2 className="cf-title">{title}</h2>

          {error && (
            <div className="cf-error">
              {error}
            </div>
          )}

          {mainFields.map(f => (
            <div key={f.name} className="cf-row">
              {renderField(f)}
            </div>
          ))}
        </div>

        {/* SIDEBAR COLUMN */}
        <div className="cf-sidebar">
          <div className="cf-card">
            <h3 className="cf-box-title">Publish</h3>
            {publishFields.length > 0 && (
              <div className="cf-publish-fields">
                {publishFields.map(f => <div key={f.name}>{renderField(f)}</div>)}
              </div>
            )}
            <div className="cf-actions">
              <button type="submit" disabled={loading}
                className={`cf-btn-save ${loading ? 'is-loading' : ''}`}>
                {stage === 'uploading' ? 'Uploading images…' : stage === 'saving' ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => router.back()}
                className="cf-btn-cancel">
                Cancel
              </button>
            </div>
          </div>

          {sideBoxes.map(box => (
            <div key={box.title} className="cf-card">
              <h3 className="cf-box-title">{box.title}</h3>
              <div className="cf-box-fields">
                {box.fields.map(f => <div key={f.name}>{renderField(f)}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
