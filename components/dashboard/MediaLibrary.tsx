'use client'
import { useEffect, useRef, useState } from 'react'
import type { Media, MediaReference } from '@/types'

const S = {
  lbl: { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 6 },
  inp: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '9px 13px', color: '#f0ede6', fontSize: 13, outline: 'none', fontFamily: 'inherit' },
  select: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '9px 12px', color: '#f0ede6', fontSize: 12, outline: 'none', fontFamily: 'var(--f-m)', cursor: 'pointer' } as React.CSSProperties,
}

const TYPE_OPTIONS = [
  { value: '', label: 'All media items' },
  { value: 'image', label: 'Images' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Documents' },
  { value: 'spreadsheet', label: 'Spreadsheets' },
  { value: 'archive', label: 'Archives' },
  { value: 'unattached', label: 'Unattached' },
  { value: 'mine', label: 'Mine' },
]

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const PAGE_SIZE_OPTIONS = [50, 100, 150, 200]

function formatBytes(n?: number) {
  if (!n) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function refLabel(refs: MediaReference[]) {
  return refs.map(r => `${r.title} (${r.type})`).join(', ')
}

export default function MediaLibrary() {
  const [items, setItems] = useState<Media[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [months, setMonths] = useState<{ year: number; month: number; count: number }[]>([])
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<Media | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleteBlocked, setDeleteBlocked] = useState<MediaReference[] | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkResult, setBulkResult] = useState<{ deleted: number; skipped: { filename: string; references: MediaReference[] }[] } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async (opts: Partial<{ search: string; page: number; type: string; date: string; limit: number }> = {}) => {
    const q    = opts.search ?? search
    const p    = opts.page   ?? page
    const t    = opts.type   ?? typeFilter
    const ym   = opts.date   ?? dateFilter
    const lim  = opts.limit  ?? limit

    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(lim) })
    if (q) params.set('search', q)
    if (t) params.set('type', t)
    if (ym) {
      const [y, m] = ym.split('-')
      params.set('year', y)
      if (m) params.set('month', m)
    }
    const res = await fetch(`/api/media?${params.toString()}`)
    const data = await res.json()
    if (data.success) {
      setItems(data.data)
      setTotal(data.total)
      setPages(data.pages)
      setPage(data.page)
      if (data.months) setMonths(data.months)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [] ) // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'sahab-portfolio')
      await fetch('/api/upload', { method: 'POST', body: fd }).catch(() => {})
    }
    setUploading(false)
    load({ page: 1 })
  }

  const saveDetails = async () => {
    if (!selected) return
    setSaving(true)
    const res = await fetch(`/api/media/${selected._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: selected.title, altText: selected.altText, caption: selected.caption }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.success) {
      setItems(p => p.map(m => m._id === selected._id ? { ...data.data, inUse: m.inUse } : m))
    }
  }

  const remove = async () => {
    if (!selected) return
    const res = await fetch(`/api/media/${selected._id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!data.success) {
      setDeleteBlocked(data.usage?.references || [])
      setConfirmingDelete(false)
      return
    }
    setItems(p => p.filter(m => m._id !== selected._id))
    setTotal(t => t - 1)
    setSelected(null)
    setConfirmingDelete(false)
  }

  const openItem = (item: Media) => {
    setSelected(item)
    setConfirmingDelete(false)
    setDeleteBlocked(null)
  }

  const toggleSelectMode = () => {
    setSelectMode(v => !v)
    setSelectedIds([])
    setBulkResult(null)
  }

  const toggleSelected = (id: string) => {
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const allOnPageSelected = items.length > 0 && items.every(i => selectedIds.includes(i._id))
  const toggleSelectAll = () => {
    if (allOnPageSelected) setSelectedIds(p => p.filter(id => !items.some(i => i._id === id)))
    else setSelectedIds(p => Array.from(new Set([...p, ...items.map(i => i._id)])))
  }

  const bulkDelete = async () => {
    if (!selectedIds.length) return
    const res = await fetch('/api/media/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    })
    const data = await res.json()
    if (!data.success) return
    setItems(p => p.filter(m => !data.deleted.includes(m._id)))
    setTotal(t => t - data.deleted.length)
    setBulkResult({ deleted: data.deleted.length, skipped: data.skipped })
    setSelectedIds([])
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { const files = Array.from(e.target.files || []); if (files.length) uploadFiles(files); e.target.value = '' }} />

      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ background: '#b8ff4f', color: '#0a0a0a', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'var(--f-m)', cursor: 'pointer', opacity: uploading ? .6 : 1 }}
        >
          {uploading ? 'Uploading…' : '+ Upload New'}
        </button>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); load({ search: e.target.value, page: 1 }) }}
          placeholder="Search by filename…"
          style={{ ...S.inp, maxWidth: 240 }}
        />
        <button type="button" onClick={toggleSelectMode}
          style={{ background: selectMode ? 'rgba(184,255,79,.12)' : 'transparent', border: `1px solid ${selectMode ? '#b8ff4f' : '#2a2a2a'}`, color: selectMode ? '#b8ff4f' : '#9a9a9a', padding: '9px 16px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f-m)', cursor: 'pointer' }}>
          {selectMode ? 'Cancel Select' : 'Select'}
        </button>
        <span style={{ fontSize: 13, color: '#555' }}>{total} item{total === 1 ? '' : 's'}</span>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); load({ type: e.target.value, page: 1 }) }} style={S.select}>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); load({ date: e.target.value, page: 1 }) }} style={S.select}>
          <option value="">All dates</option>
          {months.map(m => (
            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
              {MONTH_NAMES[m.month - 1]} {m.year} ({m.count})
            </option>
          ))}
        </select>
        <select value={limit} onChange={e => { const v = Number(e.target.value); setLimit(v); load({ limit: v, page: 1 }) }} style={S.select}>
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>Show {n}</option>)}
        </select>
      </div>

      {selectMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)' }}>
            <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} style={{ accentColor: '#b8ff4f' }} />
            Select all on page
          </label>
          <span style={{ fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)' }}>{selectedIds.length} selected</span>
          <button type="button" onClick={bulkDelete} disabled={!selectedIds.length}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--f-m)', cursor: selectedIds.length ? 'pointer' : 'default', opacity: selectedIds.length ? 1 : .5 }}>
            Delete Selected
          </button>
        </div>
      )}

      {bulkResult && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: bulkResult.skipped.length ? 'rgba(239,68,68,.08)' : 'rgba(184,255,79,.08)', border: `1px solid ${bulkResult.skipped.length ? 'rgba(239,68,68,.2)' : 'rgba(184,255,79,.2)'}`, borderRadius: 8, fontSize: 12, color: '#9a9a9a' }}>
          Deleted {bulkResult.deleted} image{bulkResult.deleted === 1 ? '' : 's'}.
          {bulkResult.skipped.length > 0 && (
            <> Skipped {bulkResult.skipped.length} still in use: {bulkResult.skipped.map(s => `${s.filename} (used in ${refLabel(s.references)})`).join('; ')}</>
          )}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#555' }}>Loading…</p>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12 }}>
          <p style={{ fontSize: 15, color: '#555' }}>No media found.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {items.map(item => (
              <button
                key={item._id}
                type="button"
                onClick={() => selectMode ? toggleSelected(item._id) : openItem(item)}
                style={{
                  aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0, position: 'relative', background: '#111',
                  border: `2px solid ${selectMode && selectedIds.includes(item._id) ? '#b8ff4f' : '#2a2a2a'}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.altText || item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {item.inUse && (
                  <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(96,165,250,.9)', color: '#0a0a0a', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, fontFamily: 'var(--f-m)' }}>
                    In use
                  </div>
                )}
                {selectMode && selectedIds.includes(item._id) && (
                  <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: '#b8ff4f', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>✓</div>
                )}
              </button>
            ))}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 24 }}>
              <button type="button" onClick={() => load({ page: page - 1 })} disabled={page <= 1}
                style={{ background: 'transparent', border: '1px solid #2a2a2a', color: page <= 1 ? '#444' : '#9a9a9a', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--f-m)', cursor: page <= 1 ? 'default' : 'pointer' }}>
                ← Prev
              </button>
              <span style={{ fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)' }}>Page {page} of {pages}</span>
              <button type="button" onClick={() => load({ page: page + 1 })} disabled={page >= pages}
                style={{ background: 'transparent', border: '1px solid #2a2a2a', color: page >= pages ? '#444' : '#9a9a9a', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--f-m)', cursor: page >= pages ? 'default' : 'pointer' }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, width: '100%', maxWidth: 820, maxHeight: '86vh', overflow: 'auto', display: 'grid', gridTemplateColumns: '1fr 320px' }}
          >
            <div style={{ background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.altText || selected.filename} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 6 }} />
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ede6', marginBottom: 4, wordBreak: 'break-all' }}>{selected.filename}</div>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--f-m)' }}>
                  {selected.width && selected.height ? `${selected.width}×${selected.height}px · ` : ''}{formatBytes(selected.size)}
                </div>
                {selected.inUse && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#60a5fa', fontFamily: 'var(--f-m)' }}>● Currently in use — can't be deleted until removed everywhere it's used</div>
                )}
              </div>

              <div>
                <label style={S.lbl}>Title</label>
                <input value={selected.title} onChange={e => setSelected(s => s && { ...s, title: e.target.value })} style={S.inp} />
              </div>
              <div>
                <label style={S.lbl}>Alt Text</label>
                <input value={selected.altText} onChange={e => setSelected(s => s && { ...s, altText: e.target.value })} style={S.inp} placeholder="Describe the image for accessibility" />
              </div>
              <div>
                <label style={S.lbl}>Caption</label>
                <textarea value={selected.caption} onChange={e => setSelected(s => s && { ...s, caption: e.target.value })} style={{ ...S.inp, minHeight: 70, resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="button" onClick={saveDetails} disabled={saving}
                  style={{ background: '#b8ff4f', color: '#0a0a0a', border: 'none', padding: '9px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'var(--f-m)', cursor: 'pointer', opacity: saving ? .6 : 1 }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setSelected(null)}
                  style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9a9a9a', padding: '9px 18px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--f-m)', cursor: 'pointer' }}>
                  Close
                </button>
              </div>

              <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 14, marginTop: 4 }}>
                {deleteBlocked && (
                  <div style={{ marginBottom: 10, fontSize: 12, color: '#ef4444' }}>
                    Can't delete — in use by: {refLabel(deleteBlocked)}
                  </div>
                )}
                {selected.inUse ? (
                  <div style={{ fontSize: 12, color: '#555' }}>Remove it from every post/project/testimonial above to delete it.</div>
                ) : confirmingDelete ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={remove} style={{ padding: '7px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--f-m)' }}>Yes, delete</button>
                    <button type="button" onClick={() => setConfirmingDelete(false)} style={{ padding: '7px 14px', background: '#222', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, color: '#9a9a9a', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmingDelete(true)}
                    style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #ef444433', borderRadius: 6, fontSize: 12, color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>
                    Delete Permanently
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
