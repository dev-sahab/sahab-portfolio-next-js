import Link from 'next/link'
import '@/styles/components/dashboard/EmptyState.scss'

interface Props {
  message: string
  action?: { label: string; href: string }
}

export default function EmptyState({ message, action }: Props) {
  return (
    <div className="empty-state">
      <p className={`empty-state-message${action ? ' has-action' : ''}`}>{message}</p>
      {action && (
        <Link href={action.href} className="empty-state-action">
          + {action.label}
        </Link>
      )}
    </div>
  )
}
