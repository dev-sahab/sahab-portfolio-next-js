/**
 * Best-effort in-memory rate limiter (vibe-coding checklist prompt 3, check
 * #5 — auth/contact/quote endpoints need rate limiting).
 *
 * Caveat: this counts requests per warm serverless function instance, not
 * globally. On Vercel that means a determined attacker spread across many
 * cold-started instances could exceed the nominal limit. It still stops the
 * common case (a script hammering one endpoint from one place), which is
 * what actually causes most vibe-coded-app incidents. For a hard guarantee
 * under real load, swap this for a shared store — e.g. Upstash Redis via
 * `@upstash/ratelimit` — without changing any call site below.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Prevent unbounded growth of the map across a long-lived warm instance.
const MAX_TRACKED_KEYS = 5000

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * @param key Unique identifier for the thing being limited, e.g. `login:1.2.3.4`.
 * @param limit Max requests allowed within `windowMs`.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear()
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count++
  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 }
}

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
