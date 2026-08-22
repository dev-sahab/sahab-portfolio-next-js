import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import { apiError } from '@/lib/apiError'

async function currentRole() {
  const session = await auth()
  return (session?.user as any)?.role as string | undefined
}

export async function GET() {
  if (!can(await currentRole(), 'users.read')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const users = await UserModel.find().select('-password').sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, data: users })
  } catch (e: any) {
    return apiError(e, 'users')
  }
}

export async function POST(req: NextRequest) {
  if (!can(await currentRole(), 'users.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { name, email, password, role } = await req.json()
    if (!name || !email || !password) return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    const existing = await UserModel.findOne({ email: email.toLowerCase() })
    if (existing) return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 400 })
    const user = await UserModel.create({ name, email, password, role: role || 'editor' })
    return NextResponse.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role, active: user.active } }, { status: 201 })
  } catch (e: any) {
    return apiError(e, 'users')
  }
}
