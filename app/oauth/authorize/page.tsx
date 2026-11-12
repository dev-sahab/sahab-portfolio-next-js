import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { v8FontVars } from '@/lib/v8/fonts'
import { approve, deny } from './actions'
import { validateAuthorize, withParams, type AuthorizeParams } from './validate'
import '@/styles/pages/(dashboard)/theme.scss'
import '@/styles/pages/login/login.scss'
import '@/styles/pages/oauth/authorize.scss'

export const metadata: Metadata = { title: 'Connect an app', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const FIELDS = ['response_type', 'client_id', 'redirect_uri', 'code_challenge', 'code_challenge_method', 'state', 'scope', 'resource'] as const

/**
 * OAuth consent page for MCP clients (Claude, ChatGPT…). The owner must be
 * signed in to the dashboard; the app gets access with *their* role, and
 * every tool still checks permissions on each call.
 */
export default async function AuthorizePage({ searchParams }: { searchParams: Promise<AuthorizeParams> }) {
  const params = await searchParams
  const v = await validateAuthorize(params)
  if (!v.ok && v.redirect) redirect(withParams(v.redirectUri, { error: v.error, error_description: v.description, state: v.state }))

  const session = await auth()
  if (v.ok && !session) {
    const back = `/oauth/authorize?${new URLSearchParams(Object.entries(params).filter(([, x]) => typeof x === 'string') as [string, string][])}`
    redirect(`/login?callbackUrl=${encodeURIComponent(back)}`)
  }

  const role = (session?.user as { role?: string } | undefined)?.role
  const abilities = [
    can(role, 'projects.read') || can(role, 'blog.read') ? 'Read your projects, blog posts, categories and tags' : null,
    can(role, 'projects.write') ? 'Create and edit projects (drafts unless you ask to publish)' : null,
    can(role, 'blog.write') || can(role, 'blog.write.own') || can(role, 'blog.write.own.draft') ? 'Create and edit blog posts (drafts unless you ask to publish)' : null,
    can(role, 'quotes.read') || can(role, 'contacts.read') ? 'Read quote requests and contact messages, and mark them as read' : null,
    can(role, 'analytics.read') ? 'See site analytics' : null,
  ].filter(Boolean) as string[]

  return (
    <div className={`dash-v8 login-page ${v8FontVars}`}>
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg__grid" />
        <div className="login-bg__glow" />
      </div>

      <main className="login-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v8/logo-dark.svg" alt="Sahab Uddin" width={188} height={47} className="dash-logo dash-logo--dark login-logo-img" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/v8/logo-light.svg" alt="" width={188} height={47} className="dash-logo dash-logo--light login-logo-img" />

        <div className="login-card oauth-card">
          {!v.ok ? (
            <>
              <p className="login-eyebrow">
                <span aria-hidden="true" />
                Connection problem
              </p>
              <h1 className="login-title">
                Can’t <em>connect.</em>
              </h1>
              <p className="login-subtitle">{v.message}</p>
            </>
          ) : (
            <>
              <p className="login-eyebrow">
                <span aria-hidden="true" />
                Connect an app
              </p>
              <h1 className="login-title oauth-title">
                Allow <em>{v.clientName}</em>?
              </h1>
              <p className="login-subtitle">
                {v.clientName} wants to manage this website for you, signed in as <strong>{session?.user?.email}</strong>.
              </p>

              {abilities.length > 0 ? (
                <ul className="oauth-list" aria-label="It will be able to">
                  {abilities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : (
                <p className="login-error">Your account’s role can’t manage content, so this app wouldn’t be able to do anything.</p>
              )}
              <p className="oauth-note">It can’t delete anything or change users and settings. You can disconnect it any time in Dashboard → Connected apps.</p>
              <p className="oauth-redirect">
                Returns to <code>{new URL(v.redirectUri).host}</code>
              </p>

              <div className="oauth-actions">
                <form action={deny}>
                  {FIELDS.map((f) => (params[f] ? <input key={f} type="hidden" name={f} value={params[f]} /> : null))}
                  <button type="submit" className="oauth-btn oauth-btn--ghost">
                    Deny
                  </button>
                </form>
                <form action={approve}>
                  {FIELDS.map((f) => (params[f] ? <input key={f} type="hidden" name={f} value={params[f]} /> : null))}
                  <button type="submit" className="login-submit oauth-btn" disabled={!abilities.length}>
                    Allow access
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
