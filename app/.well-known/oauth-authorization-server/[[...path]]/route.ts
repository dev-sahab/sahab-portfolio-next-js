import { authorizationServerMetadata, corsHeaders, originOf } from '@/lib/oauth'

// Also answers path-suffixed variants (…/oauth-authorization-server/api/mcp) that some MCP clients try.
export function GET(req: Request) {
  return Response.json(authorizationServerMetadata(originOf(req)), {
    headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
  })
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
