import type { ReactNode } from 'react'
import { cx } from '@/lib/v8/cx'
import '@/styles/v8/ui/Kbd.scss'

export default function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cx('v8-kbd', className)}>{children}</kbd>
}
