import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import '@/models/Tag'
import { calculateReadTime, slugify } from '@/lib/utils'
import { resolveTagIds } from '@/lib/taxonomy'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const post = await BlogPost.findById(id).populate('category').populate('tags').lean()
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: post })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    if (!body.slug && body.title) body.slug = slugify(body.title)
    if (body.content) body.readTime = calculateReadTime(body.content)
    if (Array.isArray(body.tags)) body.tags = await resolveTagIds(body.tags, 'blog')
    const post = await BlogPost.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: post })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const { id } = await params
    await BlogPost.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
