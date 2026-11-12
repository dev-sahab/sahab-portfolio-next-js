import type { ReactNode } from 'react'
import Link from 'next/link'
import { routes } from '@/lib/v8/routes'
import { breadcrumbSchema } from '@/lib/v8/seo'
import { cx } from '@/lib/v8/cx'
import Eyebrow from './Eyebrow'
import JsonLd from './JsonLd'
import { renderRich } from './RichText'
import '@/styles/v8/ui/PageHero.scss'

export interface Crumb {
  label: string
  href: string
}

interface PageHeroProps {
  /** Trail after "Home"; the last item is the current page. */
  crumbs: Crumb[]
  eyebrow: string
  /** Rich heading text (`*accent*`, `\n`). */
  title: string
  intro?: ReactNode
  /** Mono key/value strip under the intro ("spec sheet"). */
  meta?: { label: string; value: ReactNode }[]
  /** Extra content under the intro (buttons, chips…). */
  children?: ReactNode
  /** `compact` for long titles (blog posts, projects). */
  size?: 'default' | 'compact'
  className?: string
}

/**
 * Top of every inner page: breadcrumb path, eyebrow, display heading with
 * the serif accent, intro and an optional spec strip — the same vocabulary
 * as the homepage hero, left-aligned. Also emits the BreadcrumbList JSON-LD.
 */
export default function PageHero({ crumbs, eyebrow, title, intro, meta, children, size = 'default', className }: PageHeroProps) {
  const trail = [{ label: 'Home', href: routes.home }, ...crumbs]

  return (
    <section className={cx('v8-page-hero', `v8-page-hero--${size}`, className)} aria-labelledby="v8-page-title">
      <div className="v8-page-hero__bg" aria-hidden="true">
        <div className="v8-page-hero__grid" />
        <div className="v8-page-hero__glow" />
      </div>

      <div className="v8-container v8-page-hero__inner">
        <nav aria-label="Breadcrumb" className="v8-crumbs v8-rise">
          <ol>
            {trail.map((crumb, i) => {
              const last = i === trail.length - 1
              return (
                <li key={crumb.href}>
                  {last ? (
                    <span aria-current="page">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <Eyebrow className="v8-rise v8-rise--1">{eyebrow}</Eyebrow>

        <h1 id="v8-page-title" className="v8-page-hero__title v8-rise v8-rise--1">
          {renderRich(title)}
        </h1>

        {intro && <p className="v8-page-hero__intro v8-rise v8-rise--2">{intro}</p>}

        {children && <div className="v8-page-hero__extra v8-rise v8-rise--2">{children}</div>}

        {meta && meta.length > 0 && (
          <dl className="v8-page-hero__meta v8-rise v8-rise--3">
            {meta.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <JsonLd data={breadcrumbSchema(trail.map((c) => ({ name: c.label, path: c.href })))} />
    </section>
  )
}
