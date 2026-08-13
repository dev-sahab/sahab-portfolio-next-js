'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton'
import './TaxonomyManager.scss'

interface TaxonomyItem {
  _id: string
  name: string
  slug: string
  parent?: string | null
}

interface Props {
  kind: 'category' | 'tag'
  type: 'project' | 'blog'
  items: TaxonomyItem[]
  basePath: string
}

function buildTree(items: TaxonomyItem[]) {
  const byParent: Record<string, TaxonomyItem[]> = {}
  items.forEach((i) => {
    const key = i.parent ? String(i.parent) : 'root'
    byParent[key] = byParent[key] || []
    byParent[key].push(i)
  })
  const ordered: { item: TaxonomyItem; depth: number }[] = []
  const walk = (parentKey: string, depth: number) => {
    ;(byParent[parentKey] || []).forEach((item) => {
      ordered.push({ item, depth })
      walk(String(item._id), depth + 1)
    })
  }
  walk('root', 0)
  return ordered
}

export default function TaxonomyManager({ kind, type, items, basePath }: Props) {
  const router = useRouter()
  const endpoint = kind === 'category' ? '/api/categories' : '/api/tags'
  const noun = kind === 'category' ? 'Category' : 'Tag'
  const [name, setName] = useState('')
  const [parent, setParent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const rows = kind === 'category' ? buildTree(items) : items.map((item) => ({ item, depth: 0 }))

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), type, ...(kind === 'category' ? { parent: parent || null } : {}) }),
    })
    const data = await res.json()
    setLoading(false)
    if (!data.success) { setError(data.error || 'Failed to create'); return }
    setName('')
    setParent('')
    router.refresh()
  }

  async function handleRename(id: string) {
    if (!editValue.trim()) return
    await fetch(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editValue.trim() }),
    })
    setEditingId(null)
    router.refresh()
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="taxonomy-form">
        <div className="taxonomy-field">
          <label className="taxonomy-label">Name</label>
          <input className="taxonomy-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={`New ${kind} name`} />
        </div>
        {kind === 'category' && (
          <div className="taxonomy-field">
            <label className="taxonomy-label">Parent</label>
            <select className="taxonomy-input" value={parent} onChange={(e) => setParent(e.target.value)}>
              <option value="">— None —</option>
              {rows.map(({ item, depth }) => (
                <option key={item._id} value={item._id}>{'— '.repeat(depth)}{item.name}</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" disabled={loading} className="taxonomy-submit">
          {loading ? '…' : `+ Add ${noun}`}
        </button>
      </form>

      {error && <p className="taxonomy-error">{error}</p>}

      {rows.length === 0 ? (
        <div className="taxonomy-empty">
          <p className="taxonomy-empty-text">No {kind === 'category' ? 'categories' : 'tags'} yet.</p>
        </div>
      ) : (
        <div className="taxonomy-list">
          {rows.map(({ item, depth }) => (
            <div key={item._id} className="taxonomy-row" style={{ paddingLeft: 18 + depth * 24 }}>
              <div className="taxonomy-row-main">
                {editingId === item._id ? (
                  <input
                    autoFocus
                    className="taxonomy-input taxonomy-edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(item._id); if (e.key === 'Escape') setEditingId(null) }}
                  />
                ) : (
                  <>
                    <div className="taxonomy-item-name">{item.name}</div>
                    <div className="taxonomy-item-slug">{item.slug}</div>
                  </>
                )}
              </div>
              <div className="taxonomy-actions">
                {editingId === item._id ? (
                  <>
                    <button type="button" onClick={() => handleRename(item._id)} className="taxonomy-btn-save">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} className="taxonomy-btn-secondary">Cancel</button>
                  </>
                ) : (
                  <button type="button" onClick={() => { setEditingId(item._id); setEditValue(item.name) }} className="taxonomy-btn-secondary">Edit</button>
                )}
                <DeleteButton endpoint={`${endpoint}/${item._id}`} redirectTo={basePath} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
