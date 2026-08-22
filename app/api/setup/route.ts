import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import { apiError } from '@/lib/apiError'

/**
 * POST /api/setup
 * One-time: creates first admin user from ADMIN_EMAIL + ADMIN_PASSWORD env vars.
 * Safe — only runs if zero users exist in DB.
 */
export async function POST() {
  try {
    await connectDB()
    const count = await UserModel.countDocuments()
    if (count > 0) return NextResponse.json({ success: false, error: 'Setup already complete. Users already exist in database.' }, { status: 400 })

    const email    = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const name     = process.env.ADMIN_NAME || 'Admin'

    if (!email || !password) return NextResponse.json({ success: false, error: 'Set ADMIN_EMAIL and ADMIN_PASSWORD in env vars first' }, { status: 400 })

    const user = await UserModel.create({ name, email, password, role: 'administrator' })
    return NextResponse.json({ success: true, message: `✓ Admin user created: ${user.email}. You can now login with your env var credentials. After confirming login works, you can remove ADMIN_EMAIL/ADMIN_PASSWORD from Vercel env vars.` })
  } catch (e: any) {
    return apiError(e, 'setup')
  }
}
