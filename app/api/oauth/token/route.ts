import connectDB from '@/lib/mongodb'
import OAuthClient from '@/models/OAuthClient'
import OAuthCode from '@/models/OAuthCode'
import OAuthToken from '@/models/OAuthToken'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { corsHeaders, currentRole, issueTokens, oauthError, sha256, verifyPkce } from '@/lib/oauth'

async function readParams(req: Request): Promise<Record<string, string>> {
  const type = req.headers.get('content-type') ?? ''
  if (type.includes('application/json')) {
    const json = (await req.json().catch(() => ({}))) as Record<string, unknown>
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, typeof v === 'string' ? v : '']))
  }
  return Object.fromEntries(new URLSearchParams(await req.text()))
}

/** OAuth token endpoint: authorization_code (with PKCE) and refresh_token (rotated on every use). */
export async function POST(req: Request) {
  const { allowed, retryAfterSeconds } = rateLimit(`oauth-token:${getClientIp(req)}`, 30, 60_000)
  if (!allowed) return oauthError('slow_down', 'Too many requests.', 429, { 'Retry-After': String(retryAfterSeconds) })

  const p = await readParams(req)
  await connectDB()

  if (p.grant_type === 'authorization_code') {
    if (!p.code || !p.client_id || !p.redirect_uri) return oauthError('invalid_request', 'code, client_id and redirect_uri are required.')
    // Single use: the code is deleted the moment it's read.
    const code = (await OAuthCode.findOneAndDelete({ codeHash: sha256(p.code) }).lean()) as {
      clientId: string
      userId: string
      redirectUri: string
      codeChallenge: string
      scope: string
      expiresAt: Date
    } | null
    if (!code || new Date(code.expiresAt).getTime() < Date.now()) return oauthError('invalid_grant', 'The code is invalid or expired.')
    if (code.clientId !== p.client_id || code.redirectUri !== p.redirect_uri) return oauthError('invalid_grant', 'The code was issued to a different client.')
    if (!verifyPkce(p.code_verifier, code.codeChallenge)) return oauthError('invalid_grant', 'PKCE verification failed.')
    if (!(await currentRole(code.userId))) return oauthError('invalid_grant', 'This account no longer has access.')

    const client = (await OAuthClient.findOne({ clientId: code.clientId }, 'clientName').lean()) as { clientName?: string } | null
    const tokens = await issueTokens({ clientId: code.clientId, clientName: client?.clientName, userId: code.userId, scope: code.scope })
    return Response.json(tokens, { headers: { ...corsHeaders, 'Cache-Control': 'no-store', Pragma: 'no-cache' } })
  }

  if (p.grant_type === 'refresh_token') {
    if (!p.refresh_token) return oauthError('invalid_request', 'refresh_token is required.')
    const old = (await OAuthToken.findOne({ refreshHash: sha256(p.refresh_token) }).lean()) as {
      _id: unknown
      clientId: string
      clientName?: string
      userId: string
      scope: string
      revoked?: boolean
      refreshExpiresAt: Date
    } | null
    if (!old || new Date(old.refreshExpiresAt).getTime() < Date.now()) return oauthError('invalid_grant', 'The refresh token is invalid or expired.')
    if (old.revoked) {
      // A revoked refresh token being reused can mean it leaked: shut down the whole connection.
      await OAuthToken.updateMany({ clientId: old.clientId, userId: old.userId }, { $set: { revoked: true } })
      return oauthError('invalid_grant', 'The refresh token was revoked.')
    }
    if (p.client_id && p.client_id !== old.clientId) return oauthError('invalid_grant', 'The token was issued to a different client.')
    if (!(await currentRole(old.userId))) return oauthError('invalid_grant', 'This account no longer has access.')

    // Rotation: the old pair stops working, a new pair is issued.
    await OAuthToken.updateOne({ _id: old._id }, { $set: { revoked: true } })
    const tokens = await issueTokens({ clientId: old.clientId, clientName: old.clientName, userId: old.userId, scope: old.scope })
    return Response.json(tokens, { headers: { ...corsHeaders, 'Cache-Control': 'no-store', Pragma: 'no-cache' } })
  }

  return oauthError('unsupported_grant_type', 'Use authorization_code or refresh_token.')
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
