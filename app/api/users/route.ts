import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'

// Only admin can manage users
async function requireAdmin() {
  const session = await auth()
  if (!session) return false
  return (session.user as any)?.role === 'admin'
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: users })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { name, email, password, role } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ success: false, error: 'Name, email and password required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    const existing = await UserModel.findOne({ email: email.toLowerCase() })
    if (existing) return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 })
    const user = await UserModel.create({ name, email, password, role: role || 'editor' })
    return NextResponse.json({ success: true, data: { id: user._id, name: user.name, email: user.email, role: user.role } }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
