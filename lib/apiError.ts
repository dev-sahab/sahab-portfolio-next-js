import { NextResponse } from 'next/server'

/**
 * Central error responder for API routes (Prompt 3 of the vibe-coding
 * security checklist: "no error response sent to the client should include
 * stack traces, database query details, file paths, or internal server
 * info"). Full detail always goes to the server-side log via console.error
 * — only a safe, generic message reaches the client.
 *
 * Exception: Mongoose ValidationError/CastError just names which field was
 * invalid (e.g. "title: Path `title` is required") — that's dashboard-form
 * feedback, not an internal leak, so it's safe (and useful) to pass through
 * verbatim instead of masking it.
 */
export function apiError(e: unknown, context: string) {
  console.error(`[api:${context}]`, e)
  const isClientInputError = e instanceof Error && (e.name === 'ValidationError' || e.name === 'CastError')
  const message = isClientInputError ? e.message : 'Something went wrong. Please try again.'
  return NextResponse.json({ success: false, error: message }, { status: 500 })
}
