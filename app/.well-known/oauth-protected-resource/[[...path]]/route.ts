import { corsHeaders, originOf, protectedResourceMetadata } from '@/lib/oauth'

// Also answers /.well-known/oauth-protected-resource/api/mcp (path-suffixed discovery).
export function GET(req: Request) {
  return Response.json(protectedResourceMetadata(originOf(req)), {
    headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
  })
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
