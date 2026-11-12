'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import OAuthCode from '@/models/OAuthCode'
import { CODE_TTL_S, randomToken, sha256 } from '@/lib/oauth'
import { validateAuthorize, withParams, type AuthorizeParams } from './validate'

const fromForm = (form: FormData): AuthorizeParams =>
  Object.fromEntries(
    ['response_type', 'client_id', 'redirect_uri', 'code_challenge', 'code_challenge_method', 'state', 'scope', 'resource'].map((k) => [
      k,
      (form.get(k) as string | null) ?? undefined,
    ]),
  )

async function issuer() {
  const h = await headers()
  return `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}`
}

/** "Allow": re-validates everything server-side (hidden fields are not trusted), then sends a one-time code back to the app. */
export async function approve(form: FormData) {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!session || !userId) redirect('/login')

  const v = await validateAuthorize(fromForm(form))
  if (!v.ok) {
    if (v.redirect) redirect(withParams(v.redirectUri, { error: v.error, error_description: v.description, state: v.state }))
    throw new Error(v.message)
  }

  await connectDB()
  const code = randomToken()
  await OAuthCode.create({
    codeHash: sha256(code),
    clientId: v.clientId,
    userId,
    redirectUri: v.redirectUri,
    codeChallenge: v.codeChallenge,
    scope: v.scope,
    resource: v.resource,
    expiresAt: new Date(Date.now() + CODE_TTL_S * 1000),
  })
  redirect(withParams(v.redirectUri, { code, state: v.state, iss: await issuer() }))
}

/** "Deny": tells the app the owner said no. */
export async function deny(form: FormData) {
  const v = await validateAuthorize(fromForm(form))
  if (v.ok) redirect(withParams(v.redirectUri, { error: 'access_denied', error_description: 'The site owner declined.', state: v.state }))
  if (v.redirect) redirect(withParams(v.redirectUri, { error: v.error, state: v.state }))
  redirect('/dashboard')
}
