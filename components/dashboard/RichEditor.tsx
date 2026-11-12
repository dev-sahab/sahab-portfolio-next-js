'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block', 'link', 'image'],
    ['clean'],
  ],
}

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div data-quill-theme={theme}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={MODULES}
        placeholder={placeholder}
      />
      <style>{`
        [data-quill-theme] .ql-toolbar.ql-snow,
        [data-quill-theme] .ql-container.ql-snow { border-color: var(--border2); }
        [data-quill-theme] .ql-editor { min-height: 400px; font-size: 14px; line-height: 1.6; }
        [data-quill-theme="dark"] .ql-toolbar.ql-snow { background: var(--surface2); }
        [data-quill-theme="dark"] .ql-container.ql-snow { background: var(--surface); }
        [data-quill-theme="dark"] .ql-editor { color: var(--text); }
        [data-quill-theme="dark"] .ql-editor.ql-blank::before { color: var(--muted); font-style: normal; }
        [data-quill-theme="dark"] .ql-snow .ql-stroke { stroke: var(--text2); }
        [data-quill-theme="dark"] .ql-snow .ql-fill { fill: var(--text2); }
        [data-quill-theme="dark"] .ql-snow .ql-picker { color: var(--text2); }
        [data-quill-theme="dark"] .ql-snow .ql-picker-options { background: var(--surface2); border-color: var(--border2); }
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button:hover .ql-stroke,
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        [data-quill-theme="dark"] .ql-snow.ql-toolbar .ql-picker-label:hover { stroke: var(--accent); }
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button:hover .ql-fill,
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button.ql-active .ql-fill { fill: var(--accent); }
        [data-quill-theme="dark"] .ql-snow.ql-toolbar .ql-picker-label:hover { color: var(--accent); }
      `}</style>
    </div>
  )
}
