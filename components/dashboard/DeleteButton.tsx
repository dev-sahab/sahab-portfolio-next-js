'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './DeleteButton.scss'

interface Props { endpoint: string; redirectTo: string; label?: string }

export default function DeleteButton({ endpoint, redirectTo, label = 'Delete' }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div className="delete-actions">
        <button
          type="button"
          onClick={async () => {
            setLoading(true)
            await fetch(endpoint, { method: 'DELETE' })
            router.push(redirectTo)
            router.refresh()
          }}
          disabled={loading}
          className="delete-confirm-btn"
        >{loading ? '…' : 'Yes, delete'}</button>
        <button type="button" onClick={() => setConfirming(false)} className="delete-cancel-btn">Cancel</button>
      </div>
    )
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className="delete-trigger-btn">
      {label}
    </button>
  )
}
