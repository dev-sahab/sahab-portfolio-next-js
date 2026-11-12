import { site } from '@/content/v8/site'

export interface QuoteRequest {
  name: string
  email: string
  projectType: string
  budget: string
  timeline: string
  message: string
}

export type QuoteField = keyof QuoteRequest
export type QuoteErrors = Partial<Record<QuoteField, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validates one field (used on blur) — returns the message or undefined. */
export function validateField(field: QuoteField, data: QuoteRequest): string | undefined {
  switch (field) {
    case 'name':
      return data.name.trim() ? undefined : 'Please add your name.'
    case 'email':
      return EMAIL_RE.test(data.email.trim()) ? undefined : 'Please add a valid email address.'
    case 'message':
      return data.message.trim().length >= 10
        ? undefined
        : 'A sentence or two about the project helps me reply with a plan.'
    default:
      return undefined
  }
}

export function validateQuote(data: QuoteRequest): QuoteErrors {
  const errors: QuoteErrors = {}
  for (const field of ['name', 'email', 'message'] as const) {
    const message = validateField(field, data)
    if (message) errors[field] = message
  }
  return errors
}

/**
 * Sends the request to the existing public `/api/quote` endpoint (rate
 * limited, saved to the dashboard's Quote Requests, emailed via Resend).
 * Budget has no dedicated column there, so it travels inside `notes`.
 */
export async function submitQuote(data: QuoteRequest): Promise<void> {
  const notes = [data.budget && `Budget: ${data.budget}`, data.message.trim()].filter(Boolean).join('\n\n')

  const res = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name.trim(),
      email: data.email.trim(),
      service: data.projectType,
      timeline: data.timeline || undefined,
      estimatedTimeline: data.timeline || undefined,
      notes,
    }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error || 'Something went wrong sending your request.')
  }
}

/** Fallback offered when the API call fails: the same request as an email draft. */
export function buildQuoteMailto(data: QuoteRequest): string {
  const lines = [
    `Name: ${data.name.trim()}`,
    `Email: ${data.email.trim()}`,
    `Project: ${data.projectType}`,
    ...(data.budget ? [`Budget: ${data.budget}`] : []),
    ...(data.timeline ? [`Timeline: ${data.timeline}`] : []),
    '',
    data.message.trim(),
  ]
  const subject = `Project enquiry: ${data.projectType} (${data.name.trim()})`
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

/** Fired to scroll to the contact form and focus its first field. */
export const FOCUS_QUOTE_EVENT = 'v8:focus-quote'
