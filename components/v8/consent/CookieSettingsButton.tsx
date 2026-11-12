'use client'

import { useConsent } from './ConsentProvider'
import '@/styles/v8/consent/Consent.scss'

/** Re-opens the cookie settings. Renders nothing while no tracking tool is configured. */
export default function CookieSettingsButton({ variant = 'link' }: { variant?: 'link' | 'button' }) {
  const { needed, openPreferences } = useConsent()
  if (!needed) return null
  return (
    <button type="button" className={variant === 'button' ? 'v8-btn v8-btn--secondary' : 'v8-cookie-settings'} onClick={openPreferences}>
      Cookie settings
    </button>
  )
}
