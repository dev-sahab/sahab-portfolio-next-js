import { headerNav } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { ButtonLink } from '../ui/Button'
import Eyebrow from '../ui/Eyebrow'
import '@/styles/v8/ui/PageHero.scss'

/** 404 content in the v8 style (used by both not-found files). */
export default function NotFoundContent() {
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
