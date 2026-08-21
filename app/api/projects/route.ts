import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import '@/models/Category'
import '@/models/Tag'
import { slugify } from '@/lib/utils'
import { resolveTagIds } from '@/lib/taxonomy'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')
    const query = published === 'true' ? { published: true } : {}
    const projects = await Project.find(query).sort({ featured: -1, createdAt: -1 })
      .populate('category').populate('tags').lean()
    return NextResponse.json({ success: true, data: projects })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'projects.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const body = await req.json()
    if (!body.slug) body.slug = slugify(body.title)
    if (Array.isArray(body.tags)) body.tags = await resolveTagIds(body.tags, 'project')
    const project = await Project.create(body)
    return NextResponse.json({ success: true, data: project }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
