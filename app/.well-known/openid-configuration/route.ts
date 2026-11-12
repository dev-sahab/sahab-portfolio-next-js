import { authorizationServerMetadata, corsHeaders, originOf } from '@/lib/oauth'

// Some clients probe OpenID discovery first; serve the same OAuth metadata.
export function GET(req: Request) {
  return Response.json(authorizationServerMetadata(originOf(req)), {
    headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
  })
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
