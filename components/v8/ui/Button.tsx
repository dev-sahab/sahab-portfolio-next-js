import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { cx } from '@/lib/v8/cx'
import '@/styles/v8/ui/Button.scss'

type Variant = 'primary' | 'secondary' | 'inverse'
type Size = 'md' | 'sm'

interface CommonProps {
  variant?: Variant
  size?: Size
  /** Trailing arrow — the Figma "showArrow" prop. */
  arrow?: boolean
  /** Ember glow under the button (hero CTA only). */
  glow?: boolean
  children: ReactNode
  className?: string
}

function classes({ variant = 'primary', size = 'md', glow, className }: Omit<CommonProps, 'children'>) {
  return cx('v8-btn', `v8-btn--${variant}`, `v8-btn--${size}`, glow && 'v8-btn--glow', className)
}

function Content({ children, arrow }: Pick<CommonProps, 'children' | 'arrow'>) {
  return (
    <>
      <span>{children}</span>
      {arrow && <ArrowRight className="v8-btn__icon" aria-hidden="true" />}
    </>
  )
}

type ButtonLinkProps = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string }

/** Link styled as a button. Internal routes go through next/link. */
export function ButtonLink({ variant, size, arrow, glow, className, children, href, ...rest }: ButtonLinkProps) {
  const cls = classes({ variant, size, glow, className })
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={cls} {...rest}>
        <Content arrow={arrow}>{children}</Content>
      </Link>
    )
  }
  return (
    <a href={href} className={cls} {...rest}>
      <Content arrow={arrow}>{children}</Content>
    </a>
  )
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

export function Button({ variant, size, arrow, glow, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, glow, className })} {...rest}>
      <Content arrow={arrow}>{children}</Content>
    </button>
  )
}
