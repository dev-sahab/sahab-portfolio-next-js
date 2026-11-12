import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import connectDB from '@/lib/mongodb'
import OAuthToken from '@/models/OAuthToken'
import UserModel from '@/models/User'
import PageHeader from '@/components/dashboard/PageHeader'
import { absoluteUrl } from '@/lib/v8/routes'
import { formatDate } from '@/lib/utils'
import { disconnectApp } from './actions'
import '@/styles/pages/(dashboard)/dashboard/connected-apps/page.scss'

export const metadata: Metadata = { title: 'Connected apps' }
export const dynamic = 'force-dynamic'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = { clientId: string; clientName: string; userId: string; connectedAt: Date; lastUsedAt?: Date }

export default async function ConnectedAppsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const isAdmin = can((session.user as { role?: string }).role ?? "", 'users.write')

  await connectDB()
  const tokens = (await OAuthToken.find({
    revoked: false,
    refreshExpiresAt: { $gt: new Date() },
    ...(isAdmin ? {} : { userId: session.user.id }),
  })
    .sort({ createdAt: 1 })
    .lean()) as any[]

  // One row per app + user; tokens rotate on refresh, so keep the first connect and latest use.
  const rows = new Map<string, Row>()
  for (const t of tokens) {
    const key = `${t.clientId}:${t.userId}`
    const row = rows.get(key)
    const used = t.lastUsedAt ?? t.createdAt
    if (!row) rows.set(key, { clientId: t.clientId, clientName: t.clientName || 'Unnamed app', userId: t.userId, connectedAt: t.createdAt, lastUsedAt: used })
    else if (used && (!row.lastUsedAt || used > row.lastUsedAt)) row.lastUsedAt = used
  }
  const list = [...rows.values()]

  const ids = [...new Set(list.map((r) => r.userId))].filter((id) => /^[a-f0-9]{24}$/i.test(id))
  const users = ids.length ? ((await UserModel.find({ _id: { $in: ids } }, 'name email').lean()) as any[]) : []
  const who = (id: string) => (id === 'env-admin' ? 'Admin (env login)' : users.find((u) => String(u._id) === id)?.email ?? 'Unknown user')

  const mcpUrl = absoluteUrl('/api/mcp')

  return (
    <div className="capps-page">
      <PageHeader title="Connected apps" subtitle="AI apps like Claude and ChatGPT that can manage this site for you" />

      <section className="capps-card">
        <h2 className="capps-h">Connect an app</h2>
        <p className="capps-text">Add this address as a custom connector (MCP server). The app opens a sign-in page here; log in and click Allow.</p>
        <code className="capps-url">{mcpUrl}</code>
        <ul className="capps-steps">
          <li><strong>Claude:</strong> Settings → Connectors → Add custom connector → paste the address.</li>
          <li><strong>ChatGPT:</strong> Settings → Apps &amp; Connectors → Advanced → turn on Developer mode, then Create → paste the address, authentication OAuth.</li>
        </ul>
        <p className="capps-note">Connected apps can read everything and create or edit projects and posts (as drafts unless you ask to publish). They can’t delete anything, upload media, or change users and settings.</p>
      </section>

      <section className="capps-card">
        <h2 className="capps-h">{isAdmin ? 'All connections' : 'Your connections'}</h2>
        {list.length === 0 ? (
          <p className="capps-empty">No apps connected yet.</p>
        ) : (
          <ul className="capps-list">
            {list.map((r) => (
              <li key={`${r.clientId}:${r.userId}`} className="capps-row">
                <div className="capps-row-main">
                  <div className="capps-name">{r.clientName}</div>
                  <div className="capps-meta">
                    {isAdmin && <>{who(r.userId)} · </>}
                    Connected {formatDate(r.connectedAt)}
                    {r.lastUsedAt && <> · Last used {formatDate(r.lastUsedAt)}</>}
                  </div>
                </div>
                <form action={disconnectApp}>
                  <input type="hidden" name="clientId" value={r.clientId} />
                  <input type="hidden" name="userId" value={r.userId} />
                  <button type="submit" className="capps-disconnect">Disconnect</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
