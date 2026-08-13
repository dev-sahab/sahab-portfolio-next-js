'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import './login.scss'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="login-page d-flex items-center justify-center">
      <div className="login-box w-full">
        <div className="login-header text-center">
          <div className="login-logo mb-2">
            Sahab<span className="login-logo-dot">.</span>
          </div>
          <p className="login-subtitle">Dashboard Login</p>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="login-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="admin@example.com"
              />
            </div>

            <div className="mb-5">
              <label className="login-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="login-error mb-4">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-accent w-full justify-center" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="login-footer text-center mt-5">
          <a href="/" className="login-back-link">← Back to portfolio</a>
        </p>
      </div>
    </div>
  )
}
