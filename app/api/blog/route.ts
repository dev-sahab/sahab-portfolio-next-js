import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import { slugify, calculateReadTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')
    const query = published === 'true' ? { published: true } : {}
    const posts = await BlogPost.find(query).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: posts })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    await connectDB()
    const body = await req.json()
    if (!body.slug) body.slug = slugify(body.title)
    if (body.content) body.readTime = calculateReadTime(body.content)
    const post = await BlogPost.create(body)
    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
