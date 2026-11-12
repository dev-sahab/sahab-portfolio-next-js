'use client'

import Link from 'next/link'
import { Cookie } from 'lucide-react'
import { activeCategories } from '@/lib/v8/consent'
import { routes } from '@/lib/v8/routes'
import { useConsent } from './ConsentProvider'
import { gpcEnabled } from './gpc'
import '@/styles/v8/consent/Consent.scss'

/**
 * First-visit consent card (bottom-left, never blocks the page). "Reject
 * all" and "Accept all" get equal weight, as EU/UK regulators expect.
 */
export default function CookieBanner() {
  const { save, openPreferences } = useConsent()
  const cats = activeCategories().map((c) => c.id)
  const what = cats.includes('marketing') && cats.includes('analytics')
    ? 'analytics and marketing tools'
    : cats.includes('marketing')
      ? 'marketing tools'
      : 'analytics'

  return (
    <section className="v8-consent" role="dialog" aria-modal="false" aria-labelledby="v8-consent-title" aria-describedby="v8-consent-text">
      <div className="v8-consent__head">
        <span className="v8-consent__icon" aria-hidden="true">
          <Cookie />
        </span>
        <h2 id="v8-consent-title">Cookies, only with your OK</h2>
      </div>
      <p id="v8-consent-text" className="v8-consent__text">
        I’d like to use {what} to see what’s working on this site. Nothing is set until you choose.{' '}
        <Link href={routes.cookies}>Cookie Policy</Link>
      </p>
      <div className="v8-consent__actions">
        <button type="button" className="v8-consent__choice" onClick={() => save({ analytics: false, marketing: false })}>
          Reject all
        </button>
        <button
          type="button"
          className="v8-consent__choice"
          // A Global Privacy Control signal still opts the visitor out of marketing.
          onClick={() => save({ analytics: true, marketing: !gpcEnabled() })}
        >
          Accept all
        </button>
      </div>
      <button type="button" className="v8-consent__customize" onClick={openPreferences}>
        Choose what to allow
      </button>
    </section>
  )
}
