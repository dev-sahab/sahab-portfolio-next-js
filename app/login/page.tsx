'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 28, letterSpacing: '-.02em', marginBottom: 8 }}>
            Sahab<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <p style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>Dashboard Login</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="admin@example.com"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Password</label>
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
              <div style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'var(--f-m)', fontSize: 11, color: 'var(--muted)' }}>
          <a href="/" style={{ color: 'var(--accent)' }}>← Back to portfolio</a>
        </p>
      </div>
    </div>
  )
}
