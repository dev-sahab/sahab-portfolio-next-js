import Link from 'next/link'

interface Props {
  message: string
  action?: { label: string; href: string }
}

export default function EmptyState({ message, action }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12 }}>
      <p style={{ fontSize: 15, color: '#555', marginBottom: action ? 20 : 0 }}>{message}</p>
      {action && (
        <Link href={action.href} style={{ display: 'inline-flex', background: '#b8ff4f', color: '#0a0a0a', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--f-m)', textDecoration: 'none' }}>
          + {action.label}
        </Link>
      )}
    </div>
  )
}
