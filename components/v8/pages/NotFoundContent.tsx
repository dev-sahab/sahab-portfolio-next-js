import type { CSSProperties } from 'react'
import { routes } from '@/lib/v8/routes'
import { ButtonLink } from '../ui/Button'
import Eyebrow from '../ui/Eyebrow'
import { NotFoundSearch, NotFoundTerminal } from './NotFoundParts'
import '@/styles/v8/ui/Kbd.scss'
import '@/styles/v8/pages/NotFound.scss'

/**
 * 404 in the v8 style (used by both not-found files): big outlined 404, the
 * way back, and a terminal listing the real pages.
 *
 * No fade-in entrance here on purpose: for a missing project/post, Next
 * sends an empty error shell and renders this in the browser, where entrance
 * animations never start, leaving the content invisible. Only ambient,
 * looping motion (the ember sweep, the floating 0) is used.
 */
export default function NotFoundContent() {
  return (
    <section className="v8-404" aria-labelledby="v8-404-title">
      <div className="v8-404__bg" aria-hidden="true">
        <div className="v8-404__grid" />
        <div className="v8-404__glow" />
      </div>

      <div className="v8-container v8-404__inner">
        <p className="v8-404__digits" aria-hidden="true">
          {['4', '0', '4'].map((d, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              {d}
            </span>
          ))}
        </p>

        <Eyebrow>Error 404 · Page not found</Eyebrow>
        <h1 id="v8-404-title" className="v8-404__title">
          This page <em className="v8-em">isn’t here.</em>
        </h1>
        <p className="v8-404__text">
          The link may be old, or the page has moved. Head back home, search the site, or pick a page below.
        </p>

        <div className="v8-404__actions">
          <ButtonLink href={routes.home} arrow glow>
            Back to home
          </ButtonLink>
          <NotFoundSearch />
        </div>

        <NotFoundTerminal />
      </div>
    </section>
  )
}
