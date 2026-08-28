import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'
import { apiError } from '@/lib/apiError'
import { stripOperatorKeys } from '@/lib/sanitizeInput'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'testimonials.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const body = stripOperatorKeys(await req.json())
    const item = await Testimonial.findByIdAndUpdate(id, body, { new: true })
    return NextResponse.json({ success: true, data: item })
  } catch (e: any) {
    return apiError(e, 'testimonials/[id]')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'testimonials.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    await Testimonial.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return apiError(e, 'testimonials/[id]')
  }
}
