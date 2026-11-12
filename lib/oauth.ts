// Server-only: OAuth 2.1 authorization server for the site's MCP endpoint.
//
// Flow (MCP authorization spec): the AI app (Claude, ChatGPT) discovers the
// metadata under /.well-known, registers itself (dynamic client
// registration), sends the owner to /oauth/authorize (dashboard login +
// consent), swaps the one-time code for tokens at /api/oauth/token using
// PKCE (S256), then calls /api/mcp with `Authorization: Bearer <token>`.
import crypto from 'node:crypto'
import { Types } from 'mongoose'
import connectDB from '@/lib/mongodb'
import OAuthToken from '@/models/OAuthToken'

export const OAUTH_SCOPE = 'site'
export const ACCESS_TOKEN_TTL_S = 60 * 60 // 1 hour
export const REFRESH_TOKEN_TTL_S = 60 * 60 * 24 * 30 // 30 days
export const CODE_TTL_S = 10 * 60 // 10 minutes

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url')
export const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex')

/** Public origin of this deployment, as the client sees it (works behind Vercel's proxy). */
export function originOf(req: Request) {
  const url = new URL(req.url)
  const host = req.headers.get('x-forwarded-host') ?? url.host
  const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '')
  return `${proto}://${host}`
}

export const mcpResourceUrl = (origin: string) => `${origin}/api/mcp`
export const protectedResourceMetadataUrl = (origin: string) => `${origin}/.well-known/oauth-protected-resource`

/** RFC 8414 authorization server metadata. */
export function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/api/oauth/token`,
    registration_endpoint: `${origin}/api/oauth/register`,
    revocation_endpoint: `${origin}/api/oauth/revoke`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    revocation_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [OAUTH_SCOPE],
    service_documentation: `${origin}/`,
  }
}

/** RFC 9728 protected resource metadata for /api/mcp. */
export function protectedResourceMetadata(origin: string) {
  return {
    resource: mcpResourceUrl(origin),
    authorization_servers: [origin],
    scopes_supported: [OAUTH_SCOPE],
    bearer_methods_supported: ['header'],
    resource_name: 'Sahab Uddin site manager',
  }
}

/** Only https redirect URIs (or http on localhost, for local MCP tools) — no custom schemes, no fragments. */
export function isAllowedRedirectUri(uri: unknown): uri is string {
  if (typeof uri !== 'string' || uri.length > 2000) return false
  try {
    const url = new URL(uri)
    if (url.hash) return false
    if (url.protocol === 'https:') return true
    return url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  } catch {
    return false
  }
}

/** PKCE S256: base64url(sha256(verifier)) must equal the stored challenge (constant-time compare). */
export function verifyPkce(verifier: unknown, challenge: string) {
  if (typeof verifier !== 'string' || !/^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)) return false
  const computed = crypto.createHash('sha256').update(verifier).digest('base64url')
  const a = Buffer.from(computed)
  const b = Buffer.from(challenge)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** CORS for the endpoints AI clients call directly (metadata, register, token, revoke, mcp). */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, Mcp-Protocol-Version, Mcp-Session-Id',
  'Access-Control-Expose-Headers': 'WWW-Authenticate, Mcp-Session-Id',
  'Access-Control-Max-Age': '86400',
}

export function oauthError(error: string, description: string, status = 400, extraHeaders: Record<string, string> = {}) {
  return Response.json(
    { error, error_description: description },
    { status, headers: { ...corsHeaders, 'Cache-Control': 'no-store', ...extraHeaders } },
  )
}

/** Creates a fresh access/refresh token pair and returns the OAuth token response body. */
export async function issueTokens(opts: { clientId: string; clientName?: string; userId: string; scope: string }) {
  await connectDB()
  const accessToken = randomToken()
  const refreshToken = randomToken()
  const now = Date.now()
  await OAuthToken.create({
    accessHash: sha256(accessToken),
    refreshHash: sha256(refreshToken),
    clientId: opts.clientId,
    clientName: opts.clientName,
    userId: opts.userId,
    scope: opts.scope,
    accessExpiresAt: new Date(now + ACCESS_TOKEN_TTL_S * 1000),
    refreshExpiresAt: new Date(now + REFRESH_TOKEN_TTL_S * 1000),
  })
  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL_S,
    refresh_token: refreshToken,
    scope: opts.scope,
  }
}

/** Current role of a token's user (null = user gone or deactivated → access denied). */
export async function currentRole(userId: string): Promise<string | null> {
  if (userId === 'env-admin') return process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD ? 'administrator' : null
  if (!Types.ObjectId.isValid(userId)) return null
  const UserModel = (await import('@/models/User')).default
  const user = (await UserModel.findOne({ _id: userId, active: true }, 'role').lean()) as { role?: string } | null
  return user?.role ?? null
}

export interface McpCaller {
  userId: string
  role: string
  clientId: string
  clientName?: string
}

/** Validates `Authorization: Bearer …` for /api/mcp. Returns the caller, or null for any invalid/expired/revoked token. */
export async function authenticateBearer(req: Request): Promise<McpCaller | null> {
  const header = req.headers.get('authorization') ?? ''
  const match = /^Bearer\s+([A-Za-z0-9\-._~+/]+=*)$/i.exec(header.trim())
  if (!match) return null
  await connectDB()
  const token = (await OAuthToken.findOne({ accessHash: sha256(match[1]) }).lean()) as {
    _id: unknown
    userId: string
    clientId: string
    clientName?: string
    revoked?: boolean
    accessExpiresAt: Date
    lastUsedAt?: Date
  } | null
  if (!token || token.revoked || new Date(token.accessExpiresAt).getTime() < Date.now()) return null
  const role = await currentRole(token.userId)
  if (!role) return null
  // Record activity at most once a minute (shown on the Connected apps page).
  if (!token.lastUsedAt || Date.now() - new Date(token.lastUsedAt).getTime() > 60_000) {
    void OAuthToken.updateOne({ _id: token._id }, { $set: { lastUsedAt: new Date() } }).catch(() => {})
  }
  return { userId: token.userId, role, clientId: token.clientId, clientName: token.clientName }
}
