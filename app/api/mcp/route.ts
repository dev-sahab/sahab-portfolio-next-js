// MCP server (Streamable HTTP, stateless JSON responses) for managing the site
// from Claude, ChatGPT or any MCP client. Auth: OAuth bearer token issued by
// /api/oauth/token (see lib/oauth.ts). Tools: lib/mcp/tools.ts.
import { z } from 'zod'
import { authenticateBearer, corsHeaders, originOf, protectedResourceMetadataUrl, type McpCaller } from '@/lib/oauth'
import { rateLimit } from '@/lib/rateLimit'
import { TOOLS, ToolError } from '@/lib/mcp/tools'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SUPPORTED_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05']
const SERVER_INFO = { name: 'sahab-site', title: 'Sahab Uddin site manager', version: '1.0.0' }
const INSTRUCTIONS =
  'Manage the portfolio site of Sahab Uddin (freelance web developer): projects, blog posts, quote requests, contact messages and analytics. ' +
  'New projects and posts are saved as drafts unless the user explicitly asks to publish. Content is HTML. Nothing can be deleted through this server; ' +
  'use the dashboard for deleting, media uploads, users and settings. Call list_categories before creating content.'

/* eslint-disable @typescript-eslint/no-explicit-any */
type RpcId = string | number | null
interface RpcRequest {
  jsonrpc: '2.0'
  id?: RpcId
  method: string
  params?: any
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { ...corsHeaders, 'Cache-Control': 'no-store', ...extra } })

const rpcResult = (id: RpcId, result: unknown) => ({ jsonrpc: '2.0', id, result })
const rpcError = (id: RpcId, code: number, message: string) => ({ jsonrpc: '2.0', id, error: { code, message } })

function unauthorized(req: Request) {
  return json({ error: 'invalid_token', error_description: 'Sign in again to reconnect this app.' }, 401, {
    'WWW-Authenticate': `Bearer realm="mcp", resource_metadata="${protectedResourceMetadataUrl(originOf(req))}"`,
  })
}

function toolList(caller: McpCaller) {
  return TOOLS.filter((t) => t.allowed(caller.role)).map((t) => {
    const schema = z.toJSONSchema(t.input, { target: 'draft-7', io: 'input' }) as Record<string, unknown>
    delete schema.$schema
    return {
      name: t.name,
      title: t.title,
      description: t.description,
      inputSchema: { ...schema, type: 'object' },
      annotations: { title: t.title, readOnlyHint: t.readOnly, destructiveHint: false, idempotentHint: t.readOnly, openWorldHint: false },
    }
  })
}

async function callTool(params: any, caller: McpCaller) {
  const tool = TOOLS.find((t) => t.name === params?.name)
  if (!tool || !tool.allowed(caller.role)) return { error: [-32602, `Unknown tool: ${String(params?.name)}`] as const }
  const parsed = tool.input.safeParse(params?.arguments ?? {})
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ')
    return { result: { content: [{ type: 'text', text: `Invalid arguments. ${issues}` }], isError: true } }
  }
  try {
    const data = (await tool.run(parsed.data, caller)) as Record<string, unknown>
    return { result: { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: data } }
  } catch (e) {
    const message = e instanceof ToolError ? e.message : 'Something went wrong on the site. Try again, or check the dashboard.'
    if (!(e instanceof ToolError)) console.error(`[mcp] ${tool.name} failed:`, e)
    return { result: { content: [{ type: 'text', text: message }], isError: true } }
  }
}

async function handle(msg: RpcRequest, caller: McpCaller): Promise<object | null> {
  const id = msg.id ?? null
  const isNotification = msg.id === undefined
  switch (msg.method) {
    case 'initialize': {
      const requested = msg.params?.protocolVersion
      const protocolVersion = SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0]
      return rpcResult(id, { protocolVersion, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO, instructions: INSTRUCTIONS })
    }
    case 'ping':
      return isNotification ? null : rpcResult(id, {})
    case 'tools/list':
      return rpcResult(id, { tools: toolList(caller) })
    case 'tools/call': {
      const out = await callTool(msg.params, caller)
      return 'error' in out && out.error ? rpcError(id, out.error[0], out.error[1]) : rpcResult(id, out.result)
    }
    case 'resources/list':
      return rpcResult(id, { resources: [] })
    case 'prompts/list':
      return rpcResult(id, { prompts: [] })
    default:
      if (isNotification || msg.method.startsWith('notifications/')) return null
      return rpcError(id, -32601, `Method not found: ${msg.method}`)
  }
}

export async function POST(req: Request) {
  const caller = await authenticateBearer(req)
  if (!caller) return unauthorized(req)

  const limited = rateLimit(`mcp:${caller.userId}:${caller.clientId}`, 120, 60_000)
  if (!limited.allowed) return json(rpcError(null, -32000, 'Too many requests, slow down for a minute.'), 429)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json(rpcError(null, -32700, 'Parse error'), 400)
  }

  const batch = Array.isArray(body)
  const messages = (batch ? body : [body]) as RpcRequest[]
  if (!messages.length || messages.length > 20) return json(rpcError(null, -32600, 'Invalid request'), 400)

  const responses: object[] = []
  for (const msg of messages) {
    if (!msg || msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
      // Responses from the client (to server requests we never send) are simply accepted.
      if (msg && typeof msg === 'object' && ('result' in msg || 'error' in msg)) continue
      responses.push(rpcError((msg as RpcRequest)?.id ?? null, -32600, 'Invalid request'))
      continue
    }
    const res = await handle(msg, caller)
    if (res) responses.push(res)
  }

  if (!responses.length) return new Response(null, { status: 202, headers: corsHeaders })
  return json(batch ? responses : responses[0])
}

// No server-initiated stream and no sessions in this stateless server.
export function GET() {
  return new Response('Method Not Allowed', { status: 405, headers: { ...corsHeaders, Allow: 'POST, OPTIONS' } })
}
export const DELETE = GET

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
