import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import '@/models/Category'
import '@/models/Tag'
import { slugify } from '@/lib/utils'
import { resolveTagIds } from '@/lib/taxonomy'
import { apiError } from '@/lib/apiError'
import { stripOperatorKeys } from '@/lib/sanitizeInput'
import { revalidateProjects } from '@/lib/revalidatePublic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const project = await Project.findById(id).populate('category').populate('tags').lean()
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    // An unpublished draft is only visible to staff with projects.read —
    // report it as 404 (not 403) to an unauthorized caller so the id can't
    // be used as a "does this draft exist" oracle either.
    if (!(project as any).published) {
      const session = await auth()
      if (!can((session?.user as any)?.role, 'projects.read')) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      }
    }
    return NextResponse.json({ success: true, data: project })
  } catch (e: any) {
    return apiError(e, 'projects/[id]')
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'projects.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const body = stripOperatorKeys(await req.json())
    if (!body.slug && body.title) body.slug = slugify(body.title)
    if (Array.isArray(body.tags)) body.tags = await resolveTagIds(body.tags, 'project')
    const project = await Project.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!project) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    revalidateProjects()
    return NextResponse.json({ success: true, data: project })
  } catch (e: any) {
    return apiError(e, 'projects/[id]')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'projects.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    await Project.findByIdAndDelete(id)
    revalidateProjects()
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch (e: any) {
    return apiError(e, 'projects/[id]')
  }
}
