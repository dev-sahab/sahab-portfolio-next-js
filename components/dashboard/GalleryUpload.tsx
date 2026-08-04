'use client'
import { useState } from 'react'
import MediaPicker from './MediaPicker'

interface Props {
  value?: string[]
  onChange: (urls: string[]) => void
  folder?: string
  label?: string
  /** Stage a newly-picked file instead of uploading it immediately. */
  onStageUpload?: (blobUrl: string, file: File) => void
  /** Stage an existing (already-uploaded) image for deletion — only applied once the form is actually saved. */
  onStageDelete?: (url: string) => void
}

export default function GalleryUpload({ value = [], onChange, folder = 'sahab-portfolio', label = 'Gallery', onStageUpload, onStageDelete }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const remove = (i: number) => {
    const url = value[i]
    onChange(value.filter((_, j) => j !== i))
    if (!url || url.startsWith('blob:')) return
    onStageDelete
      ? onStageDelete(url)
      : fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }).catch(() => {})
  }

  const reorder = (from: number, to: number) => {
    if (from === to) return
    const next = [...value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  const lbl = { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 8 }

  return (
    <div>
      <label style={lbl}>{label}</label>

      {value.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
          {value.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (dragIndex !== null) reorder(dragIndex, i); setDragIndex(null) }}
              onDragEnd={() => setDragIndex(null)}
              style={{
                position: 'relative', aspectRatio: '4/3', borderRadius: 6, overflow: 'hidden',
                background: '#111', border: '1px solid #2a2a2a', cursor: 'grab',
                opacity: dragIndex === i ? 0.4 : 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {url.startsWith('blob:') && (
                <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(184,255,79,.9)', color: '#0a0a0a', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, fontFamily: 'var(--f-m)' }}>
                  Pending
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.75)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        style={{
          width: '100%', border: '2px dashed #2a2a2a', borderRadius: 8, padding: 16, textAlign: 'center',
          cursor: 'pointer', background: '#111', color: '#9a9a9a',
          fontSize: 13, fontFamily: 'var(--f-m)',
        }}
      >
        + Add Images
      </button>

      {pickerOpen && (
        <MediaPicker
          multiple
          folder={folder}
          onSelect={urls => onChange([...value, ...urls])}
          onClose={() => setPickerOpen(false)}
          onStageUpload={onStageUpload}
        />
      )}
    </div>
  )
}
