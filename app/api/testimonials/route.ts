import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import Testimonial from '@/models/Testimonial'
import { apiError } from '@/lib/apiError'
import { stripOperatorKeys } from '@/lib/sanitizeInput'

export async function GET() {
  try {
    await connectDB()
    const items = await Testimonial.find().sort({ order: 1 }).lean()
    return NextResponse.json({ success: true, data: items })
  } catch (e: any) {
    return apiError(e, 'testimonials')
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'testimonials.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const body = stripOperatorKeys(await req.json())
    const item = await Testimonial.create(body)
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (e: any) {
    return apiError(e, 'testimonials')
  }
}
