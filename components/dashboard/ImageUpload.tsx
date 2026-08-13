'use client'
import { useState } from 'react'
import MediaPicker from './MediaPicker'
import './ImageUpload.scss'

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
      <label className="iu-lbl">{label}</label>

      {value ? (
        <div className="iu-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="iu-preview-img" />
          {value.startsWith('blob:') && (
            <div className="iu-pending-badge">
              Pending — saves with post
            </div>
          )}
          <button onClick={remove} type="button" className="iu-remove-btn">
            ×
          </button>
          <button onClick={() => setPickerOpen(true)} type="button" className="iu-replace-btn">
            Replace
          </button>
        </div>
      ) : (
        <div
          onClick={() => setPickerOpen(true)}
          className="iu-dropzone"
        >
          <div className="iu-dropzone-icon">📷</div>
          <div className="iu-dropzone-title">Choose Image</div>
          <div className="iu-dropzone-hint">Upload new or select from Media Library</div>
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
