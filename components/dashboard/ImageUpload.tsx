'use client'
import { useState } from 'react'
import MediaPicker from './MediaPicker'

interface Props {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  /** Stage a newly-picked file instead of uploading it immediately. */
  onStageUpload?: (blobUrl: string, file: File) => void
  /** Stage an existing (already-uploaded) image for deletion — only applied once the form is actually saved. */
  onStageDelete?: (url: string) => void
}

export default function ImageUpload({ value, onChange, folder = 'sahab-portfolio', label = 'Image', onStageUpload, onStageDelete }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const lbl = { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 8 }

  const stageOldValueForDeletion = (old: string) => {
    if (!old || old.startsWith('blob:')) return
    onStageDelete ? onStageDelete(old) : fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: old }) }).catch(() => {})
  }

  const remove = () => {
    stageOldValueForDeletion(value || '')
    onChange('')
  }

  const replace = (urls: string[]) => {
    stageOldValueForDeletion(value || '')
    onChange(urls[0])
  }

  return (
    <div>
      <label style={lbl}>{label}</label>

      {value ? (
        <div style={{ position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 6 }} />
          {value.startsWith('blob:') && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(184,255,79,.9)', color: '#0a0a0a', borderRadius: 4, padding: '3px 8px', fontSize: 10, fontWeight: 700, fontFamily: 'var(--f-m)' }}>
              Pending — saves with post
            </div>
          )}
          <button onClick={remove} type="button"
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.75)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ×
          </button>
          <button onClick={() => setPickerOpen(true)} type="button"
            style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.75)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--f-m)' }}>
            Replace
          </button>
        </div>
      ) : (
        <div
          onClick={() => setPickerOpen(true)}
          style={{ border: '2px dashed #2a2a2a', borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', background: '#111', transition: 'border-color .2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#b8ff4f')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 4 }}>Choose Image</div>
          <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--f-m)' }}>Upload new or select from Media Library</div>
        </div>
      )}

      {pickerOpen && (
        <MediaPicker
          folder={folder}
          onSelect={replace}
          onClose={() => setPickerOpen(false)}
          onStageUpload={onStageUpload}
        />
      )}
    </div>
  )
}
