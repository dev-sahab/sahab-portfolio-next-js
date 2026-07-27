import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'

/**
 * POST /api/setup
 * Creates the first admin user from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * Only works if NO users exist in the database yet (safe one-time call).
 */
export async function POST() {
  try {
    await connectDB()
    const count = await UserModel.countDocuments()
    if (count > 0) {
      return NextResponse.json({ success: false, error: 'Setup already complete. Users exist.' }, { status: 400 })
    }
    const email    = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const name     = process.env.ADMIN_NAME || 'Admin'
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'ADMIN_EMAIL and ADMIN_PASSWORD env vars required' }, { status: 400 })
    }
    const user = await UserModel.create({ name, email, password, role: 'admin' })
    return NextResponse.json({ success: true, message: `Admin user created: ${user.email}. You can now remove ADMIN_EMAIL/ADMIN_PASSWORD from env vars.` })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
