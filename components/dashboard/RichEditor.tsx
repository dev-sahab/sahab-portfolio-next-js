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
        [data-quill-theme] .ql-container.ql-snow { border-color: #2a2a2a; }
        [data-quill-theme] .ql-editor { min-height: 400px; font-size: 14px; line-height: 1.6; }
        [data-quill-theme="dark"] .ql-toolbar.ql-snow { background: #1a1a1a; }
        [data-quill-theme="dark"] .ql-container.ql-snow { background: #111; }
        [data-quill-theme="dark"] .ql-editor { color: #f0ede6; }
        [data-quill-theme="dark"] .ql-editor.ql-blank::before { color: #555; font-style: normal; }
        [data-quill-theme="dark"] .ql-snow .ql-stroke { stroke: #9a9a9a; }
        [data-quill-theme="dark"] .ql-snow .ql-fill { fill: #9a9a9a; }
        [data-quill-theme="dark"] .ql-snow .ql-picker { color: #9a9a9a; }
        [data-quill-theme="dark"] .ql-snow .ql-picker-options { background: #1a1a1a; border-color: #2a2a2a; }
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button:hover .ql-stroke,
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        [data-quill-theme="dark"] .ql-snow.ql-toolbar .ql-picker-label:hover { stroke: #b8ff4f; }
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button:hover .ql-fill,
        [data-quill-theme="dark"] .ql-snow.ql-toolbar button.ql-active .ql-fill { fill: #b8ff4f; }
        [data-quill-theme="dark"] .ql-snow.ql-toolbar .ql-picker-label:hover { color: #b8ff4f; }
      `}</style>
    </div>
  )
}
