import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import { normalizeRole } from '@/lib/permissions'
import UsersClient from '@/components/dashboard/UsersClient'
import type { User } from '@/types'

export default async function UsersPage() {
  await connectDB()
  const raw = await UserModel.find().select('-password').sort({ createdAt: -1 }).lean()
  // Normalize any pre-migration "admin" role strings still in the DB so the
  // role <select> below shows a real match instead of nothing.
  const users = JSON.parse(JSON.stringify(raw)).map((u: User) => ({
    ...u,
    role: normalizeRole(u.role) || u.role,
  })) as User[]

  return <UsersClient initialUsers={users} />
}
