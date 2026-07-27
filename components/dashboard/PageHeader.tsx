import Link from 'next/link'

interface Props {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em', marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: '#9a9a9a' }}>{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#b8ff4f', color: '#0a0a0a', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: 'var(--f-m)', textDecoration: 'none', transition: 'opacity .2s' }}>
          + {action.label}
        </Link>
      )}
    </div>
  )
}
