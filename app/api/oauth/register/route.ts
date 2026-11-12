import connectDB from '@/lib/mongodb'
import OAuthClient from '@/models/OAuthClient'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { corsHeaders, isAllowedRedirectUri, oauthError, randomToken } from '@/lib/oauth'

/**
 * OAuth Dynamic Client Registration (RFC 7591). Claude and ChatGPT call this
 * when you add the connector. Registering grants nothing by itself: every
 * app still needs the owner's dashboard login + "Allow" on the consent page.
 */
export async function POST(req: Request) {
  const { allowed, retryAfterSeconds } = rateLimit(`oauth-register:${getClientIp(req)}`, 10, 60 * 60_000)
  if (!allowed) return oauthError('slow_down', 'Too many registrations. Try again later.', 429, { 'Retry-After': String(retryAfterSeconds) })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return oauthError('invalid_client_metadata', 'Body must be JSON.')
  }

  const redirectUris = Array.isArray(body.redirect_uris) ? body.redirect_uris : []
  if (!redirectUris.length || redirectUris.length > 10 || !redirectUris.every(isAllowedRedirectUri)) {
    return oauthError('invalid_redirect_uri', 'redirect_uris must be 1–10 https URLs (or http://localhost).')
  }
  const method = body.token_endpoint_auth_method
  if (method !== undefined && method !== 'none') {
    return oauthError('invalid_client_metadata', 'Only public clients (token_endpoint_auth_method "none") with PKCE are supported.')
  }

  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : undefined)
  const url = (v: unknown) => (typeof v === 'string' && /^https:\/\//.test(v) ? v.slice(0, 500) : undefined)

  await connectDB()
  const clientId = `mcp_${randomToken(18)}`
  const client = await OAuthClient.create({
    clientId,
    clientName: text(body.client_name, 100) || 'Unnamed app',
    redirectUris,
    clientUri: url(body.client_uri),
    logoUri: url(body.logo_uri),
  })

  return Response.json(
    {
      client_id: client.clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: client.clientName,
      redirect_uris: client.redirectUris,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    },
    { status: 201, headers: { ...corsHeaders, 'Cache-Control': 'no-store' } },
  )
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
