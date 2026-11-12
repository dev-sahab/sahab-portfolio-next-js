/**
 * Cookie consent for analytics / marketing tools.
 *
 * TRACKING_TOOLS is the list of tools the site uses (or is about to use) —
 * the Privacy and Cookie policies always describe all of them. A tool
 * actually loads once its env var is set (e.g. NEXT_PUBLIC_GA_ID) AND the
 * visitor has accepted its category. The banner appears as soon as at least
 * one tool is configured. next.config.ts opens the CSP for a tool's domains
 * only when its ID is set. To add another tool: add it here, load it in
 * components/v8/consent/ConsentProvider.tsx, and allow its domains in the CSP.
 */

export type ConsentCategory = 'analytics' | 'marketing'

export interface ConsentState {
  analytics: boolean
  marketing: boolean
}

export interface TrackingTool {
  id: string
  name: string
  provider: string
  category: ConsentCategory
  purpose: string
  cookies: string
  duration: string
  /** Configured = its ID is set in the environment. */
  enabled: boolean
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || ''
/** Google Ads conversion ID, e.g. AW-123456789. */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''
export const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || ''

export const TRACKING_TOOLS: TrackingTool[] = [
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    provider: 'Google',
    category: 'analytics',
    purpose: 'Counts visits and shows which pages are useful, so the site can be improved.',
    cookies: '_ga, _ga_*',
    duration: 'Up to 2 years',
    enabled: Boolean(GA_ID),
  },
  {
    id: 'clarity',
    name: 'Microsoft Clarity',
    provider: 'Microsoft',
    category: 'analytics',
    purpose: 'Heatmaps and anonymised session replays that show where pages are confusing.',
    cookies: '_clck, _clsk, CLID',
    duration: 'Up to 1 year',
    enabled: Boolean(CLARITY_ID),
  },
  {
    id: 'meta-pixel',
    name: 'Meta Pixel',
    provider: 'Meta (Facebook, Instagram)',
    category: 'marketing',
    purpose: 'Measures ads on Facebook and Instagram and lets them be shown to people who visited this site.',
    cookies: '_fbp, fr',
    duration: 'Up to 3 months',
    enabled: Boolean(META_PIXEL_ID),
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    provider: 'Google',
    category: 'marketing',
    purpose: 'Measures which Google ads lead to enquiries, and lets ads reach people who visited this site.',
    cookies: '_gcl_au, _gcl_aw',
    duration: 'Up to 3 months',
    enabled: Boolean(GOOGLE_ADS_ID),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Insight Tag',
    provider: 'LinkedIn',
    category: 'marketing',
    purpose: 'Measures LinkedIn ads and shows which companies and roles visit the site (in aggregate).',
    cookies: 'li_sugr, bcookie, lidc, UserMatchHistory',
    duration: 'Up to 1 year',
    enabled: Boolean(LINKEDIN_PARTNER_ID),
  },
]

export const ACTIVE_TOOLS = TRACKING_TOOLS.filter((t) => t.enabled)
export const NEEDS_CONSENT = ACTIVE_TOOLS.length > 0

export const CONSENT_CATEGORIES: { id: ConsentCategory; label: string; description: string }[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Anonymous visit statistics that show which pages help and which don’t.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Measures ads and lets them reach people who have visited this site.',
  },
]

/** Bump to ask everyone again (e.g. when a new tool or purpose is added). */
export const CONSENT_VERSION = 1
export const CONSENT_STORAGE_KEY = 'sahab-consent'

interface StoredConsent extends ConsentState {
  v: number
  /** ISO date the choice was made. */
  at: string
}

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsent
    if (parsed.v !== CONSENT_VERSION) return null
    return { analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing) }
  } catch {
    return null
  }
}

export function writeConsent(state: ConsentState) {
  try {
    const value: StoredConsent = { ...state, v: CONSENT_VERSION, at: new Date().toISOString() }
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* private mode: the choice simply isn't remembered */
  }
}

/** Categories that actually have a configured tool (the panel only shows those). */
export const activeCategories = () => CONSENT_CATEGORIES.filter((c) => ACTIVE_TOOLS.some((t) => t.category === c.id))
