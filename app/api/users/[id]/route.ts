import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'

async function requireAdmin() {
  const session = await auth()
  if (!session) return false
  return (session.user as any)?.role === 'admin'
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    // Don't allow password update via this route — use dedicated endpoint
    delete body.password
    const user = await UserModel.findByIdAndUpdate(id, body, { new: true }).select('-password')
    if (!user) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    await UserModel.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
