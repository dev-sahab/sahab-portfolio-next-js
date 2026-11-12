// Server-only: validates an /oauth/authorize request (used by the page and by the approve/deny actions).
import connectDB from '@/lib/mongodb'
import OAuthClient from '@/models/OAuthClient'
import { OAUTH_SCOPE } from '@/lib/oauth'

export interface AuthorizeParams {
  response_type?: string
  client_id?: string
  redirect_uri?: string
  code_challenge?: string
  code_challenge_method?: string
  state?: string
  scope?: string
  resource?: string
}

export type Validated =
  | { ok: true; clientId: string; clientName: string; clientUri?: string; redirectUri: string; codeChallenge: string; state?: string; scope: string; resource?: string }
  // Unsafe to redirect (unknown client / unregistered redirect): show the error on our page.
  | { ok: false; redirect: false; message: string }
  // Safe to send the error back to the (verified) redirect URI.
  | { ok: false; redirect: true; redirectUri: string; error: string; description: string; state?: string }

export async function validateAuthorize(p: AuthorizeParams): Promise<Validated> {
  if (!p.client_id || !p.redirect_uri) return { ok: false, redirect: false, message: 'This link is missing the app or return address.' }
  await connectDB()
  const client = (await OAuthClient.findOne({ clientId: p.client_id }).lean()) as {
    clientId: string
    clientName: string
    clientUri?: string
    redirectUris: string[]
  } | null
  if (!client) return { ok: false, redirect: false, message: 'This app isn’t registered. Remove the connector and add it again.' }
  if (!client.redirectUris.includes(p.redirect_uri)) return { ok: false, redirect: false, message: 'The return address doesn’t match what this app registered.' }

  const back = (error: string, description: string): Validated => ({ ok: false, redirect: true, redirectUri: p.redirect_uri!, error, description, state: p.state })
  if (p.response_type !== 'code') return back('unsupported_response_type', 'Only response_type=code is supported.')
  if (!p.code_challenge || p.code_challenge_method !== 'S256' || !/^[A-Za-z0-9\-_]{43,128}$/.test(p.code_challenge)) {
    return back('invalid_request', 'PKCE with code_challenge_method=S256 is required.')
  }
  const scope = p.scope?.trim() || OAUTH_SCOPE
  if (scope.split(/\s+/).some((s) => s !== OAUTH_SCOPE)) return back('invalid_scope', `Only the "${OAUTH_SCOPE}" scope is available.`)

  return {
    ok: true,
    clientId: client.clientId,
    clientName: client.clientName,
    clientUri: client.clientUri,
    redirectUri: p.redirect_uri,
    codeChallenge: p.code_challenge,
    state: p.state,
    scope,
    resource: p.resource,
  }
}

export function withParams(base: string, params: Record<string, string | undefined>) {
  const url = new URL(base)
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, v)
  return url.toString()
}
