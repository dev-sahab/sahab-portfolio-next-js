'use client'
import { useState, useRef } from 'react'

interface Props {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
}

export default function ImageUpload({ value, onChange, folder = 'sahab-portfolio', label = 'Image' }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setPreview(data.data.url)
      onChange(data.data.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const lbl = { display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase' as const, color: '#555', marginBottom: 8 }

  return (
    <div>
      <label style={lbl}>{label}</label>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #2a2a2a', borderRadius: 8, padding: 20, textAlign: 'center',
          cursor: 'pointer', transition: 'border-color .2s', background: '#111',
          marginBottom: preview ? 12 : 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#b8ff4f')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {uploading ? (
          <div style={{ color: '#b8ff4f', fontFamily: 'var(--f-m)', fontSize: 13 }}>Uploading…</div>
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 4 }}>Click or drag image here</div>
            <div style={{ fontSize: 11, color: '#555', fontFamily: 'var(--f-m)' }}>JPG, PNG, WebP — max 10MB</div>
          </>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
          <button
            onClick={() => { setPreview(''); onChange('') }}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >×</button>
        </div>
      )}

      {/* URL input fallback */}
      <input
        type="url"
        placeholder="Or paste image URL directly"
        value={preview}
        onChange={(e) => { setPreview(e.target.value); onChange(e.target.value) }}
        style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 6, padding: '8px 12px', color: '#f0ede6', fontSize: 13, outline: 'none', marginTop: 8, fontFamily: 'var(--f-m)' }}
      />

      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{error}</p>}
    </div>
  )
}
