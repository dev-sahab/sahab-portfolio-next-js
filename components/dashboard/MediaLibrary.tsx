'use client'
import { useEffect, useRef, useState } from 'react'
import type { Media, MediaReference } from '@/types'
import './MediaLibrary.scss'

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
      <input ref={inputRef} type="file" accept="image/*" multiple className="d-none"
        onChange={e => { const files = Array.from(e.target.files || []); if (files.length) uploadFiles(files); e.target.value = '' }} />

      <div className="mlib-toolbar">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mlib-upload-btn"
        >
          {uploading ? 'Uploading…' : '+ Upload New'}
        </button>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); load({ search: e.target.value, page: 1 }) }}
          placeholder="Search by filename…"
          className="mlib-input mlib-search-input"
        />
        <button type="button" onClick={toggleSelectMode}
          className={selectMode ? 'mlib-select-btn active' : 'mlib-select-btn'}>
          {selectMode ? 'Cancel Select' : 'Select'}
        </button>
        <span className="mlib-count">{total} item{total === 1 ? '' : 's'}</span>
      </div>

      <div className="mlib-filters">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); load({ type: e.target.value, page: 1 }) }} className="mlib-select">
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); load({ date: e.target.value, page: 1 }) }} className="mlib-select">
          <option value="">All dates</option>
          {months.map(m => (
            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
              {MONTH_NAMES[m.month - 1]} {m.year} ({m.count})
            </option>
          ))}
        </select>
        <select value={limit} onChange={e => { const v = Number(e.target.value); setLimit(v); load({ limit: v, page: 1 }) }} className="mlib-select">
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>Show {n}</option>)}
        </select>
      </div>

      {selectMode && (
        <div className="mlib-selectbar">
          <label className="mlib-selectall-label">
            <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="mlib-accent-cb" />
            Select all on page
          </label>
          <span className="mlib-meta-text">{selectedIds.length} selected</span>
          <button type="button" onClick={bulkDelete} disabled={!selectedIds.length}
            className="mlib-bulkdelete-btn">
            Delete Selected
          </button>
        </div>
      )}

      {bulkResult && (
        <div className={bulkResult.skipped.length ? 'mlib-bulkresult has-skipped' : 'mlib-bulkresult'}>
          Deleted {bulkResult.deleted} image{bulkResult.deleted === 1 ? '' : 's'}.
          {bulkResult.skipped.length > 0 && (
            <> Skipped {bulkResult.skipped.length} still in use: {bulkResult.skipped.map(s => `${s.filename} (used in ${refLabel(s.references)})`).join('; ')}</>
          )}
        </div>
      )}

      {loading ? (
        <p className="mlib-loading-text">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mlib-empty">
          <p className="mlib-empty-text">No media found.</p>
        </div>
      ) : (
        <>
          <div className="mlib-grid">
            {items.map(item => (
              <button
                key={item._id}
                type="button"
                onClick={() => selectMode ? toggleSelected(item._id) : openItem(item)}
                className={selectMode && selectedIds.includes(item._id) ? 'mlib-grid-item is-selected' : 'mlib-grid-item'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.altText || item.filename} className="mlib-grid-img" />
                {item.inUse && (
                  <div className="mlib-badge-inuse">
                    In use
                  </div>
                )}
                {selectMode && selectedIds.includes(item._id) && (
                  <div className="mlib-badge-check">✓</div>
                )}
              </button>
            ))}
          </div>

          {pages > 1 && (
            <div className="mlib-pagination">
              <button type="button" onClick={() => load({ page: page - 1 })} disabled={page <= 1}
                className="mlib-page-btn">
                ← Prev
              </button>
              <span className="mlib-meta-text">Page {page} of {pages}</span>
              <button type="button" onClick={() => load({ page: page + 1 })} disabled={page >= pages}
                className="mlib-page-btn">
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="mlib-modal-overlay"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="mlib-modal"
          >
            <div className="mlib-modal-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.altText || selected.filename} className="mlib-modal-preview-img" />
            </div>
            <div className="d-flex flex-col gap-4 p-5">
              <div>
                <div className="mlib-filename">{selected.filename}</div>
                <div className="mlib-filemeta">
                  {selected.width && selected.height ? `${selected.width}×${selected.height}px · ` : ''}{formatBytes(selected.size)}
                </div>
                {selected.inUse && (
                  <div className="mlib-inuse-note">● Currently in use — can't be deleted until removed everywhere it's used</div>
                )}
              </div>

              <div>
                <label className="mlib-label">Title</label>
                <input value={selected.title} onChange={e => setSelected(s => s && { ...s, title: e.target.value })} className="mlib-input" />
              </div>
              <div>
                <label className="mlib-label">Alt Text</label>
                <input value={selected.altText} onChange={e => setSelected(s => s && { ...s, altText: e.target.value })} className="mlib-input" placeholder="Describe the image for accessibility" />
              </div>
              <div>
                <label className="mlib-label">Caption</label>
                <textarea value={selected.caption} onChange={e => setSelected(s => s && { ...s, caption: e.target.value })} className="mlib-input mlib-textarea" />
              </div>

              <div className="d-flex gap-2 mt-1">
                <button type="button" onClick={saveDetails} disabled={saving}
                  className="mlib-save-btn">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setSelected(null)}
                  className="mlib-close-btn">
                  Close
                </button>
              </div>

              <div className="mlib-delete-section">
                {deleteBlocked && (
                  <div className="mlib-delete-blocked">
                    Can't delete — in use by: {refLabel(deleteBlocked)}
                  </div>
                )}
                {selected.inUse ? (
                  <div className="mlib-delete-hint">Remove it from every post/project/testimonial above to delete it.</div>
                ) : confirmingDelete ? (
                  <div className="d-flex gap-2">
                    <button type="button" onClick={remove} className="mlib-confirm-yes">Yes, delete</button>
                    <button type="button" onClick={() => setConfirmingDelete(false)} className="mlib-confirm-cancel">Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmingDelete(true)}
                    className="mlib-delete-btn">
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
