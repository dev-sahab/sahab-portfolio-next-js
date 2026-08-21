'use client'
import { useEffect, useRef, useState } from 'react'
import type { Media } from '@/types'
import '@/styles/components/dashboard/MediaPicker.scss'

interface Props {
  multiple?: boolean
  folder?: string
  onSelect: (urls: string[]) => void
  onClose: () => void
  /** When provided, "Upload New" stages the file locally (blob preview) instead of
   *  uploading immediately — the caller is responsible for uploading it for real later. */
  onStageUpload?: (blobUrl: string, file: File) => void
}

export default function MediaPicker({ multiple = false, folder = 'sahab-portfolio', onSelect, onClose, onStageUpload }: Props) {
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [items, setItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const load = async (q = '') => {
    setLoading(true)
    const res = await fetch(`/api/media${q ? `?search=${encodeURIComponent(q)}` : ''}`)
    const data = await res.json()
    if (data.success) setItems(data.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const toggle = (item: Media) => {
    if (!multiple) { onSelect([item.url]); onClose(); return }
    setSelectedIds(p => p.includes(item._id) ? p.filter(id => id !== item._id) : [...p, item._id])
  }

  const confirmSelection = () => {
    const urls = items.filter(i => selectedIds.includes(i._id)).map(i => i.url)
    if (urls.length) onSelect(urls)
    onClose()
  }

  const stageFiles = (files: File[]) => {
    const blobUrls = files.map(file => {
      const blobUrl = URL.createObjectURL(file)
      onStageUpload?.(blobUrl, file)
      return blobUrl
    })
    onSelect(blobUrls)
    onClose()
  }

  const uploadFiles = async (files: File[]) => {
    if (onStageUpload) { stageFiles(files); return }
    setUploading(true); setError('')
    const uploaded: string[] = []
    for (const file of files) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', folder)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        uploaded.push(data.data.url)
        if (!multiple) { onSelect([data.data.url]); onClose(); return }
      } catch (e: any) {
        setError(e.message)
      }
    }
    setUploading(false)
    if (multiple && uploaded.length) { onSelect(uploaded); onClose() }
  }

  return (
    <div
      onClick={onClose}
      className="mp-overlay"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="mp-modal"
      >
        <div className="mp-header">
          <div className="mp-tabs">
            <button type="button" onClick={() => setTab('library')} className={`mp-tab ${tab === 'library' ? 'is-active' : ''}`}>Media Library</button>
            <button type="button" onClick={() => setTab('upload')} className={`mp-tab ${tab === 'upload' ? 'is-active' : ''}`}>Upload New</button>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="mp-close-btn">×</button>
        </div>

        <div className="mp-body">
          {tab === 'library' ? (
            <>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); load(e.target.value) }}
                placeholder="Search by filename…"
                className="mp-search-input"
              />
              {loading ? (
                <p className="mp-loading-text">Loading…</p>
              ) : items.length === 0 ? (
                <p className="mp-empty-text">No media yet — switch to "Upload New" to add some.</p>
              ) : (
                <div className="mp-library-grid">
                  {items.map(item => {
                    const isSelected = selectedIds.includes(item._id)
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => toggle(item)}
                        className={`mp-library-item ${isSelected ? 'is-selected' : ''}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.altText || item.filename} className="mp-library-item-img" />
                        {multiple && isSelected && (
                          <div className="mp-selected-check">✓</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="mp-file-input"
                onChange={e => { const files = Array.from(e.target.files || []); if (files.length) uploadFiles(files); e.target.value = '' }} />
              <div
                onClick={() => inputRef.current?.click()}
                onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files || []); if (files.length) uploadFiles(multiple ? files : [files[0]]) }}
                onDragOver={e => e.preventDefault()}
                className="mp-dropzone"
              >
                {uploading ? (
                  <div className="mp-uploading">
                    <div className="mp-uploading-icon">⏳</div>
                    Uploading to Cloudinary…
                  </div>
                ) : (
                  <>
                    <div className="mp-dropzone-icon">📷</div>
                    <div className="mp-dropzone-title">Click or drag {multiple ? 'images' : 'an image'} here</div>
                    <div className="mp-dropzone-hint">JPG · PNG · WebP · GIF — max 10 MB</div>
                  </>
                )}
              </div>
              {error && <p className="mp-error">{error}</p>}
            </>
          )}
        </div>

        {tab === 'library' && multiple && (
          <div className="mp-footer">
            <span className="mp-footer-count">{selectedIds.length} selected</span>
            <div className="mp-footer-actions">
              <button type="button" onClick={onClose} className="mp-footer-cancel-btn">Cancel</button>
              <button type="button" onClick={confirmSelection} disabled={!selectedIds.length}
                className="mp-footer-confirm-btn">
                Add {selectedIds.length || ''} Image{selectedIds.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
