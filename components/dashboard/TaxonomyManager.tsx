'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton'

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

const S = {
  input: { width: '100%', padding: '10px 12px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 14, color: '#f0ede6', outline: 'none' } as const,
  label: { fontSize: 12, color: '#9a9a9a', marginBottom: 6, display: 'block', fontFamily: 'var(--f-m)' } as const,
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
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={S.label}>Name</label>
          <input style={S.input} value={name} onChange={(e) => setName(e.target.value)} placeholder={`New ${kind} name`} />
        </div>
        {kind === 'category' && (
          <div style={{ flex: 1 }}>
            <label style={S.label}>Parent</label>
            <select style={S.input} value={parent} onChange={(e) => setParent(e.target.value)}>
              <option value="">— None —</option>
              {rows.map(({ item, depth }) => (
                <option key={item._id} value={item._id}>{'— '.repeat(depth)}{item.name}</option>
              ))}
            </select>
          </div>
        )}
        <button type="submit" disabled={loading} style={{ background: '#b8ff4f', color: '#0a0a0a', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--f-m)', border: 'none', cursor: 'pointer' }}>
          {loading ? '…' : `+ Add ${noun}`}
        </button>
      </form>

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12 }}>
          <p style={{ fontSize: 15, color: '#555' }}>No {kind === 'category' ? 'categories' : 'tags'} yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rows.map(({ item, depth }) => (
            <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 18px', paddingLeft: 18 + depth * 24 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === item._id ? (
                  <input
                    autoFocus
                    style={{ ...S.input, padding: '6px 10px', fontSize: 13 }}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(item._id); if (e.key === 'Escape') setEditingId(null) }}
                  />
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#f0ede6' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#555', fontFamily: 'var(--f-m)' }}>{item.slug}</div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {editingId === item._id ? (
                  <>
                    <button onClick={() => handleRename(item._id)} style={{ padding: '7px 14px', background: '#b8ff4f', border: 'none', borderRadius: 6, fontSize: 12, color: '#0a0a0a', fontFamily: 'var(--f-m)', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ padding: '7px 14px', background: '#222', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)', cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => { setEditingId(item._id); setEditValue(item.name) }} style={{ padding: '7px 14px', background: '#222', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)', cursor: 'pointer' }}>Edit</button>
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
