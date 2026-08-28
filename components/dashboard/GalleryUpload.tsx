'use client'
import { useState } from 'react'
import MediaPicker from './MediaPicker'
import '@/styles/components/dashboard/GalleryUpload.scss'

interface Props {
  value?: string[]
  onChange: (urls: string[]) => void
  folder?: string
  label?: string
  /** Stage a newly-picked file instead of uploading it immediately. */
  onStageUpload?: (blobUrl: string, file: File) => void
  /** Stage an existing (already-uploaded) image for deletion — only applied once the form is actually saved. */
  onStageDelete?: (url: string) => void
  /** The form's cover/feature image (if any) — offered as a "Quick Add" pick
   *  in the picker so it can be reused in the gallery without re-uploading or
   *  hunting for it in the Media Library, even while it's still a staged
   *  (not-yet-uploaded) blob: preview. */
  featuredImageUrl?: string
}

export default function GalleryUpload({ value = [], onChange, folder = 'sahab-portfolio', label = 'Gallery', onStageUpload, onStageDelete, featuredImageUrl }: Props) {
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

  return (
    <div>
      <label className="gu-lbl">{label}</label>

      {value.length > 0 && (
        <div className="gu-grid">
          {value.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); if (dragIndex !== null) reorder(dragIndex, i); setDragIndex(null) }}
              onDragEnd={() => setDragIndex(null)}
              className={`gu-item ${dragIndex === i ? 'is-dragging' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Gallery ${i + 1}`} className="gu-item-img" />
              {url.startsWith('blob:') && (
                <div className="gu-pending-badge">
                  Pending
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                className="gu-remove-btn"
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
        className="gu-add-btn"
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
          pinned={featuredImageUrl && !value.includes(featuredImageUrl) ? [{ url: featuredImageUrl, label: 'Feature Image' }] : []}
        />
      )}
    </div>
  )
}
