'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import OAuthToken from '@/models/OAuthToken'

/**
 * Disconnects an AI app: revokes every token that app holds for the user.
 * Administrators can disconnect any user's app; everyone else only their own.
 */
export async function disconnectApp(form: FormData) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return
  const clientId = String(form.get('clientId') ?? '')
  const owner = String(form.get('userId') ?? '')
  if (!clientId || !owner) return
  if (owner !== userId && !can((session!.user! as { role?: string }).role ?? "", 'users.write')) return
  await connectDB()
  await OAuthToken.updateMany({ clientId, userId: owner, revoked: false }, { $set: { revoked: true } })
  revalidatePath('/dashboard/connected-apps')
}
