import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { canWriteContent } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import '@/models/Tag'
import { slugify, calculateReadTime } from '@/lib/utils'
import { resolveTagIds } from '@/lib/taxonomy'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')
    const query = published === 'true' ? { published: true } : {}
    const posts = await BlogPost.find(query).sort({ createdAt: -1 })
      .populate('category').populate('tags').lean()
    return NextResponse.json({ success: true, data: posts })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  const body = await req.json()
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
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
