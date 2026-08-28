import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import Tag from '@/models/Tag'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import { slugify } from '@/lib/utils'
import { apiError } from '@/lib/apiError'
import { stripOperatorKeys } from '@/lib/sanitizeInput'
import { revalidateTaxonomy } from '@/lib/revalidatePublic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const tag = await Tag.findById(id).lean()
    if (!tag) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: tag })
  } catch (e: any) {
    return apiError(e, 'tags/[id]')
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'tags.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const body = stripOperatorKeys(await req.json())
    if (body.name && !body.slug) body.slug = slugify(body.name)
    const tag = await Tag.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!tag) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    revalidateTaxonomy()
    return NextResponse.json({ success: true, data: tag })
  } catch (e: any) {
    return apiError(e, 'tags/[id]')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'tags.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const tag = await Tag.findById(id)
    if (!tag) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const Model = tag.type === 'project' ? Project : BlogPost
    await Model.updateMany({ tags: id }, { $pull: { tags: id } })

    await Tag.findByIdAndDelete(id)
    revalidateTaxonomy()
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e: any) {
    return apiError(e, 'tags/[id]')
  }
}
