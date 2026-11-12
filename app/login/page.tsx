'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import '@/styles/pages/(dashboard)/theme.scss'
import '@/styles/pages/login/login.scss'
import { v8FontVars } from '@/lib/v8/fonts'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      // Same message for a wrong email, wrong password or rate limit: don't reveal which.
      setError('That email and password don’t match. Try again in a moment.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className={`dash-v8 login-page ${v8FontVars}`}>
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg__grid" />
        <div className="login-bg__glow" />
      </div>

      <main className="login-box">
        <a href="/" className="login-logo" aria-label="Sahab Uddin, back to the website">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v8/logo-dark.svg" alt="" width={188} height={47} className="dash-logo dash-logo--dark" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v8/logo-light.svg" alt="" width={188} height={47} className="dash-logo dash-logo--light" />
        </a>

        <div className="login-card">
          <p className="login-eyebrow">
            <span aria-hidden="true" />
            Dashboard
          </p>
          <h1 className="login-title">
            Welcome <em>back.</em>
          </h1>
          <p className="login-subtitle">Sign in to manage projects, posts and messages.</p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">
                Password
              </label>
              <div className="login-password">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-password__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="login-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        <a href="/" className="login-back">
          <ArrowLeft size={14} aria-hidden="true" />
          Back to the website
        </a>
      </main>
    </div>
  )
}
