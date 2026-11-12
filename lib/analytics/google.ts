// Server-only module: imported only by server components and route handlers.
import crypto from 'node:crypto'

/**
 * Google API access for the dashboard's Analytics page, via a service
 * account (no user OAuth flow). Setup: create a service account in Google
 * Cloud, enable the "Google Analytics Data API" and "Google Search Console
 * API", then add the service account's email as a Viewer in the GA4
 * property and as a user in Search Console. Credentials live only in env
 * vars and are only ever used on the server.
 */

export const analyticsEnv = {
  clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
  // Env files store the key on one line with literal "\n".
  privateKey: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  ga4PropertyId: (process.env.GA4_PROPERTY_ID || '').replace(/^properties\//, ''),
  searchConsoleSite: process.env.SEARCH_CONSOLE_SITE_URL || '',
  pageSpeedKey: process.env.PAGESPEED_API_KEY || '',
  siteUrl: process.env.PAGESPEED_URL || process.env.NEXT_PUBLIC_SITE_URL || '',
}

export const hasServiceAccount = () => Boolean(analyticsEnv.clientEmail && analyticsEnv.privateKey)

const tokenCache = new Map<string, { token: string; expires: number }>()

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url')

/** OAuth access token for the service account (JWT bearer grant), cached until shortly before expiry. */
export async function getAccessToken(scopes: string[]): Promise<string> {
  const key = scopes.join(' ')
  const cached = tokenCache.get(key)
  if (cached && cached.expires > Date.now() + 60_000) return cached.token

  const now = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(
    JSON.stringify({ iss: analyticsEnv.clientEmail, scope: key, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }),
  )
  const signature = crypto.createSign('RSA-SHA256').update(`${header}.${claims}`).sign(analyticsEnv.privateKey)
  const assertion = `${header}.${claims}.${b64url(signature)}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Google sign-in failed (${res.status}). Check the service account email and private key.`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache.set(key, { token: data.access_token, expires: Date.now() + data.expires_in * 1000 })
  return data.access_token
}

/** Authorised JSON POST to a Google API, with a readable error message. */
export async function googlePost<T>(url: string, scopes: string[], body: unknown): Promise<T> {
  const token = await getAccessToken(scopes)
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    let message = `${res.status}`
    try {
      const err = (await res.json()) as { error?: { message?: string } }
      if (err.error?.message) message = err.error.message
    } catch {}
    throw new Error(message)
  }
  return (await res.json()) as T
}

// ── Small in-memory cache so reloading the page doesn't re-hit the APIs ──
const memo = new Map<string, { value: unknown; expires: number }>()

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as T
  const value = await load()
  memo.set(key, { value, expires: Date.now() + ttlMs })
  return value
}

// ── Date ranges ──
export type RangeDays = 7 | 28 | 90
export const RANGES: RangeDays[] = [7, 28, 90]

const iso = (d: Date) => d.toISOString().slice(0, 10)
const daysAgo = (n: number) => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d
}

/** Current and previous period of `days` days, ending `lagDays` ago (Search Console data lags ~3 days). */
export function periods(days: RangeDays, lagDays = 1) {
  return {
    current: { startDate: iso(daysAgo(lagDays + days - 1)), endDate: iso(daysAgo(lagDays)) },
    previous: { startDate: iso(daysAgo(lagDays + days * 2 - 1)), endDate: iso(daysAgo(lagDays + days)) },
  }
}

/** Every date in a range, so charts show zero days instead of skipping them. */
export function eachDay(startDate: string, endDate: string) {
  const out: string[] = []
  const d = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)
  while (d <= end) {
    out.push(iso(d))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return out
}

export type SectionResult<T> =
  | { status: 'ok'; data: T }
  | { status: 'not-configured'; missing: string[] }
  | { status: 'error'; message: string }
