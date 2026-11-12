import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { cx } from '@/lib/v8/cx'
import '@/styles/v8/ui/Button.scss'

type Variant = 'primary' | 'secondary' | 'inverse'
type Size = 'md' | 'sm'

interface CommonProps {
  variant?: Variant
  size?: Size
  /** Trailing arrow — the Figma "showArrow" prop. */
  arrow?: boolean
  /** Opens in a new tab: ↗ icon, target/rel set, screen-reader note. */
  external?: boolean
  /** Ember glow under the button (hero CTA only). */
  glow?: boolean
  children: ReactNode
  className?: string
}

function classes({ variant = 'primary', size = 'md', glow, className }: Omit<CommonProps, 'children'>) {
  return cx('v8-btn', `v8-btn--${variant}`, `v8-btn--${size}`, glow && 'v8-btn--glow', className)
}

function Content({ children, arrow, external }: Pick<CommonProps, 'children' | 'arrow' | 'external'>) {
  return (
    <>
      <span>{children}</span>
      {arrow && <ArrowRight className="v8-btn__icon" aria-hidden="true" />}
      {external && (
        <>
          <ArrowUpRight className="v8-btn__icon" aria-hidden="true" />
          <span className="v8-sr-only"> (opens in a new tab)</span>
        </>
      )}
    </>
  )
}

type ButtonLinkProps = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string }

/** Link styled as a button. Internal routes go through next/link. */
export function ButtonLink({ variant, size, arrow, external, glow, className, children, href, ...rest }: ButtonLinkProps) {
  const cls = classes({ variant, size, glow, className })
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        <Content external>{children}</Content>
      </a>
    )
  }
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

export function Button({ variant, size, arrow, external: _external, glow, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, glow, className })} {...rest}>
      <Content arrow={arrow}>{children}</Content>
    </button>
  )
}
