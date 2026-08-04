'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props { endpoint: string; redirectTo: string; label?: string }

export default function DeleteButton({ endpoint, redirectTo, label = 'Delete' }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          onClick={async () => {
            setLoading(true)
            await fetch(endpoint, { method: 'DELETE' })
            router.push(redirectTo)
            router.refresh()
          }}
          disabled={loading}
          style={{ padding: '7px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--f-m)' }}
        >{loading ? '…' : 'Yes, delete'}</button>
        <button type="button" onClick={() => setConfirming(false)} style={{ padding: '7px 12px', background: '#222', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, color: '#9a9a9a', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>Cancel</button>
      </div>
    )
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #ef444433', borderRadius: 6, fontSize: 12, color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--f-m)' }}>
      {label}
    </button>
  )
}
