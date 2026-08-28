import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import SiteSettings from '@/models/SiteSettings'
import { apiError } from '@/lib/apiError'
import { stripOperatorKeys } from '@/lib/sanitizeInput'

export async function GET() {
  try {
    await connectDB()
    let settings = await SiteSettings.findOne().lean()
    if (!settings) settings = await SiteSettings.create({})
    return NextResponse.json({ success: true, data: settings })
  } catch (e: any) {
    return apiError(e, 'settings')
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'settings.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const body = stripOperatorKeys(await req.json())
    const settings = await SiteSettings.findOneAndUpdate({}, body, { new: true, upsert: true, runValidators: true })
    return NextResponse.json({ success: true, data: settings })
  } catch (e: any) {
    return apiError(e, 'settings')
  }
}
