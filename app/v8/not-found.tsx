import type { Metadata } from 'next'
import { headerNav } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { ButtonLink } from '@/components/v8/ui/Button'
import Eyebrow from '@/components/v8/ui/Eyebrow'
import '@/styles/v8/ui/PageHero.scss'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: false } }

/** 404 inside the v8 layout (unknown /v8 URLs and missing projects/posts). */
export default function V8NotFound() {
  return (
    <section className="v8-page-hero v8-404" aria-labelledby="v8-page-title">
      <div className="v8-page-hero__bg" aria-hidden="true">
        <div className="v8-page-hero__grid" />
        <div className="v8-page-hero__glow" />
      </div>
      <div className="v8-container v8-page-hero__inner">
        <Eyebrow>Error 404</Eyebrow>
        <h1 id="v8-page-title" className="v8-page-hero__title">
          This page <em className="v8-em">isn’t here.</em>
        </h1>
        <p className="v8-page-hero__intro">The link may be old, or the page has moved. These are the places most people are looking for:</p>
        <div className="v8-page-hero__extra">
          <ButtonLink href={routes.home} arrow>
            Back to home
          </ButtonLink>
          {headerNav.slice(0, 3).map((link) => (
            <ButtonLink key={link.href} href={link.href} variant="secondary">
              {link.label}
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  )
}
