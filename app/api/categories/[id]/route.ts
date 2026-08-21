import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import { slugify } from '@/lib/utils'
import { getOrCreateUncategorized } from '@/lib/taxonomy'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const category = await Category.findById(id).lean()
    if (!category) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: category })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'categories.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    if (body.name && !body.slug) body.slug = slugify(body.name)
    const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!category) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: category })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'categories.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const category = await Category.findById(id)
    if (!category) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const hasChildren = await Category.exists({ parent: id })
    if (hasChildren) {
      return NextResponse.json({ success: false, error: 'Move or delete child categories first' }, { status: 400 })
    }

    const fallback = await getOrCreateUncategorized(category.type)
    const Model = category.type === 'project' ? Project : BlogPost
    if (String(fallback._id) !== String(id)) {
      await Model.updateMany({ category: id }, { category: fallback._id })
    }

    await Category.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
