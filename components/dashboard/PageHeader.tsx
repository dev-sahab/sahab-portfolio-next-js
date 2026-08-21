import Link from 'next/link'
import '@/styles/components/dashboard/PageHeader.scss'

interface Props {
  title: string
  subtitle?: string
  action?: { label: string; href: string }
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className="page-header-action">
          + {action.label}
        </Link>
      )}
    </div>
  )
}
