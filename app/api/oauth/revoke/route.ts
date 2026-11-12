import connectDB from '@/lib/mongodb'
import OAuthToken from '@/models/OAuthToken'
import { corsHeaders, sha256 } from '@/lib/oauth'

/** RFC 7009 token revocation: accepts an access or refresh token. Always 200, as the spec requires. */
export async function POST(req: Request) {
  const params = new URLSearchParams(await req.text())
  const token = params.get('token')
  if (token) {
    await connectDB()
    const hash = sha256(token)
    await OAuthToken.updateOne({ $or: [{ accessHash: hash }, { refreshHash: hash }] }, { $set: { revoked: true } })
  }
  return new Response(null, { status: 200, headers: corsHeaders })
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
