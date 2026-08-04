'use client'
import { useEffect, useRef, useState } from 'react'
import type { Media } from '@/types'

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

  const tabStyle = (active: boolean) => ({
    padding: '10px 18px', fontSize: 13, fontFamily: 'var(--f-m)', cursor: 'pointer', background: 'none', border: 'none',
    color: active ? '#b8ff4f' : '#9a9a9a', borderBottom: `2px solid ${active ? '#b8ff4f' : 'transparent'}`,
  })

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, width: '100%', maxWidth: 900, maxHeight: '86vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2a2a2a', padding: '0 20px' }}>
          <div style={{ display: 'flex' }}>
            <button type="button" onClick={() => setTab('library')} style={tabStyle(tab === 'library')}>Media Library</button>
            <button type="button" onClick={() => setTab('upload')} style={tabStyle(tab === 'upload')}>Upload New</button>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: '#9a9a9a', fontSize: 20, cursor: 'pointer', padding: 8 }}>×</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {tab === 'library' ? (
            <>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); load(e.target.value) }}
                placeholder="Search by filename…"
                style={{ width: '100%', maxWidth: 320, background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '9px 13px', color: '#f0ede6', fontSize: 13, outline: 'none', marginBottom: 16 }}
              />
              {loading ? (
                <p style={{ color: '#555' }}>Loading…</p>
              ) : items.length === 0 ? (
                <p style={{ color: '#555', textAlign: 'center', padding: '40px 0' }}>No media yet — switch to "Upload New" to add some.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                  {items.map(item => {
                    const isSelected = selectedIds.includes(item._id)
                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => toggle(item)}
                        style={{
                          aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0, position: 'relative',
                          border: `2px solid ${isSelected ? '#b8ff4f' : '#2a2a2a'}`, background: '#111',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.altText || item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {multiple && isSelected && (
                          <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: '#b8ff4f', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>✓</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <input ref={inputRef} type="file" accept="image/*" multiple={multiple} style={{ display: 'none' }}
                onChange={e => { const files = Array.from(e.target.files || []); if (files.length) uploadFiles(files); e.target.value = '' }} />
              <div
                onClick={() => inputRef.current?.click()}
                onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files || []); if (files.length) uploadFiles(multiple ? files : [files[0]]) }}
                onDragOver={e => e.preventDefault()}
                style={{ border: '2px dashed #2a2a2a', borderRadius: 8, padding: 60, textAlign: 'center', cursor: 'pointer', background: '#111' }}
              >
                {uploading ? (
                  <div style={{ color: '#b8ff4f', fontFamily: 'var(--f-m)', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
                    Uploading to Cloudinary…
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
                    <div style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 4 }}>Click or drag {multiple ? 'images' : 'an image'} here</div>
                    <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--f-m)' }}>JPG · PNG · WebP · GIF — max 10 MB</div>
                  </>
                )}
              </div>
              {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 10 }}>{error}</p>}
            </>
          )}
        </div>

        {tab === 'library' && multiple && (
          <div style={{ borderTop: '1px solid #2a2a2a', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)' }}>{selectedIds.length} selected</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid #2a2a2a', color: '#9a9a9a', padding: '9px 18px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--f-m)', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={confirmSelection} disabled={!selectedIds.length}
                style={{ background: '#b8ff4f', color: '#0a0a0a', border: 'none', padding: '9px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'var(--f-m)', cursor: 'pointer', opacity: selectedIds.length ? 1 : .5 }}>
                Add {selectedIds.length || ''} Image{selectedIds.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
