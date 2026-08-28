import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can, canWriteContent } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import '@/models/Tag'
import { calculateReadTime, slugify } from '@/lib/utils'
import { resolveTagIds } from '@/lib/taxonomy'
import { apiError } from '@/lib/apiError'
import { stripOperatorKeys } from '@/lib/sanitizeInput'
import { revalidateBlog } from '@/lib/revalidatePublic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const post = await BlogPost.findById(id).populate('category').populate('tags').lean()
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    // Same rule as /api/projects/[id]: an unpublished draft 404s for anyone
    // without blog.read instead of revealing it exists.
    if (!(post as any).published) {
      const session = await auth()
      if (!can((session?.user as any)?.role, 'blog.read')) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      }
    }
    return NextResponse.json({ success: true, data: post })
  } catch (e: any) {
    return apiError(e, 'blog/[id]')
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const { id } = await params
    const existing = await BlogPost.findById(id)
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const role = (session.user as any)?.role
    const userId = (session.user as any)?.id
    const body = stripOperatorKeys(await req.json())
    const isOwner = !!existing.author && String(existing.author) === String(userId)
    // A published post staying published, or a draft being flipped to
    // published, both count as "publishing" — contributors can do neither.
    const publishing = existing.published === true || body.published === true
    if (!canWriteContent(role, 'blog', { isOwner, publishing })) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    if (!body.slug && body.title) body.slug = slugify(body.title)
    if (body.content) body.readTime = calculateReadTime(body.content)
    if (Array.isArray(body.tags)) body.tags = await resolveTagIds(body.tags, 'blog')
    const post = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    revalidateBlog()
    return NextResponse.json({ success: true, data: post })
  } catch (e: any) {
    return apiError(e, 'blog/[id]')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const { id } = await params
    const existing = await BlogPost.findById(id)
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const role = (session.user as any)?.role
    const userId = (session.user as any)?.id
    const isOwner = !!existing.author && String(existing.author) === String(userId)
    if (!canWriteContent(role, 'blog', { isOwner, publishing: existing.published === true })) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await BlogPost.findByIdAndDelete(id)
    revalidateBlog()
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e: any) {
    return apiError(e, 'blog/[id]')
  }
}
