'use client'
import { useMemo, useRef, useState } from 'react'
import '@/styles/components/dashboard/CategoryCombobox.scss'

interface CategoryItem { _id: string; name: string; parent?: string | null }

interface Props {
  label: string
  value: string
  onChange: (id: string) => void
  categories: CategoryItem[]
  taxonomyType: 'project' | 'blog'
  required?: boolean
}

function buildTree(items: CategoryItem[]) {
  const byParent: Record<string, CategoryItem[]> = {}
  items.forEach(i => {
    const key = i.parent ? String(i.parent) : 'root'
    byParent[key] = byParent[key] || []
    byParent[key].push(i)
  })
  const ordered: { item: CategoryItem; depth: number }[] = []
  const walk = (parentKey: string, depth: number) => {
    ;(byParent[parentKey] || []).forEach(item => {
      ordered.push({ item, depth })
      walk(String(item._id), depth + 1)
    })
  }
  walk('root', 0)
  return ordered
}

export default function CategoryCombobox({ label, value, onChange, categories, taxonomyType, required }: Props) {
  const [localCategories, setLocalCategories] = useState(categories)
  const [query, setQuery] = useState(() => localCategories.find(c => String(c._id) === value)?.name || '')
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tree = useMemo(() => buildTree(localCategories), [localCategories])
  const q = query.trim().toLowerCase()
  const filtered = q ? tree.filter(({ item }) => item.name.toLowerCase().includes(q)) : tree
  const exactMatch = localCategories.some(c => c.name.toLowerCase() === q)
  const showCreate = q.length > 0 && !exactMatch

  const select = (item: CategoryItem) => {
    onChange(String(item._id))
    setQuery(item.name)
    setOpen(false)
  }

  const create = async () => {
    const name = query.trim()
    if (!name || creating) return
    setCreating(true); setError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type: taxonomyType, parent: null }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to create category')
      setLocalCategories(prev => [...prev, data.data])
      onChange(String(data.data._id))
      setQuery(data.data.name)
      setOpen(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="combobox-wrap">
      <label className="combobox-label">{label}{required && ' *'}</label>
      <input
        type="text"
        value={query}
        placeholder="Type to search or create…"
        className="combobox-input"
        onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimeout.current = setTimeout(() => setOpen(false), 150) }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            if (filtered.length > 0) select(filtered[0].item)
            else if (showCreate) create()
          }
          if (e.key === 'Escape') setOpen(false)
        }}
      />
      {open && (filtered.length > 0 || showCreate) && (
        <div className="combobox-dropdown">
          {filtered.map(({ item, depth }) => (
            <div
              key={item._id}
              onMouseDown={e => { e.preventDefault(); if (blurTimeout.current) clearTimeout(blurTimeout.current); select(item) }}
              className="combobox-option"
              style={{ paddingLeft: 14 + depth * 16 }}
            >
              {depth > 0 ? `— ${item.name}` : item.name}
            </div>
          ))}
          {showCreate && (
            <div
              onMouseDown={e => { e.preventDefault(); if (blurTimeout.current) clearTimeout(blurTimeout.current); create() }}
              className={`combobox-option-create ${creating ? 'is-disabled' : ''} ${filtered.length ? 'is-divided' : ''}`}
            >
              {creating ? 'Creating…' : `+ Create “${query.trim()}”`}
            </div>
          )}
        </div>
      )}
      {error && <p className="combobox-error">{error}</p>}
    </div>
  )
}
