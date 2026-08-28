import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { can, canWriteContent } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import '@/models/Tag'
import { slugify, calculateReadTime } from '@/lib/utils'
import { resolveTagIds } from '@/lib/taxonomy'
import { apiError } from '@/lib/apiError'
import { stripOperatorKeys } from '@/lib/sanitizeInput'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')
    // Same rule as /api/projects: unpublished drafts only ever go to a
    // signed-in staff member with blog.read — never to an anonymous caller,
    // no matter what the query string says.
    const session = await auth()
    const canReadDrafts = can((session?.user as any)?.role, 'blog.read')
    const query = canReadDrafts && published !== 'true' ? {} : { published: true }
    const posts = await BlogPost.find(query).sort({ createdAt: -1 })
      .populate('category').populate('tags').lean()
    return NextResponse.json({ success: true, data: posts })
  } catch (e: any) {
    return apiError(e, 'blog')
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  const body = stripOperatorKeys(await req.json())
  // A new post is trivially "own" — the question is only whether this role
  // is allowed to create it at the requested publish state.
  if (!canWriteContent(role, 'blog', { isOwner: true, publishing: body.published === true })) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }
  try {
    await connectDB()
    const userId = (session.user as any)?.id
    if (Types.ObjectId.isValid(userId)) body.author = userId
    if (!body.slug) body.slug = slugify(body.title)
    if (body.content) body.readTime = calculateReadTime(body.content)
    if (Array.isArray(body.tags)) body.tags = await resolveTagIds(body.tags, 'blog')
    const post = await BlogPost.create(body)
    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (e: any) {
    return apiError(e, 'blog')
  }
}
