'use client'

import { useEffect } from 'react'

interface ErrorScreenProps {
  error: Error & { digest?: string }
  retry: () => void
  /** Where the secondary link goes. */
  homeHref?: string
  homeLabel?: string
}

/**
 * Shared fallback for error boundaries: says what happened (the real message
 * for browser errors, a reference code for server errors, whose details stay
 * in the server log) and offers retry / reload. Inline styles so it renders
 * even when the stylesheet is what failed to load.
 */
export default function ErrorScreen({ error, retry, homeHref = '/', homeLabel = 'Go to the homepage' }: ErrorScreenProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isServer = Boolean(error.digest)
  // A failed script download after a new deploy: a full reload fixes it.
  const isStale = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(`${error.name} ${error.message}`)

  return (
    <div style={styles.wrap} role="alert">
      <div style={styles.card}>
        <p style={styles.eyebrow}>Something went wrong</p>
        <h1 style={styles.title}>This page couldn’t load.</h1>
        <p style={styles.text}>
          {isStale
            ? 'The site was just updated. Reload the page to get the latest version.'
            : isServer
              ? 'The server hit an error. Try again in a moment.'
              : 'Try again. If it keeps happening, send the details below.'}
        </p>
        <pre style={styles.detail}>
          {isServer ? `Reference: ${error.digest}` : `${error.name}: ${error.message}`}
        </pre>
        <div style={styles.actions}>
          <button type="button" style={styles.primary} onClick={() => (isStale ? window.location.reload() : retry())}>
            {isStale ? 'Reload' : 'Try again'}
          </button>
          <button type="button" style={styles.secondary} onClick={() => window.location.reload()}>
            Reload page
          </button>
          <a href={homeHref} style={styles.link}>
            {homeLabel}
          </a>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#0b0b0c', color: '#f4f2ee', fontFamily: 'ui-sans-serif, system-ui, sans-serif' },
  card: { width: 'min(520px, 100%)', padding: 32, borderRadius: 18, border: '1px solid #2e2e33', background: '#141416' },
  eyebrow: { margin: 0, font: '500 12px/1 ui-monospace, monospace', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#ff7a5c' },
  title: { margin: '12px 0 8px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em' },
  text: { margin: 0, color: '#a7a5a0', lineHeight: 1.55 },
  detail: { margin: '18px 0 0', padding: '12px 14px', borderRadius: 10, background: '#1b1b1e', color: '#a7a5a0', font: '12.5px/1.5 ui-monospace, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  actions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 22 },
  primary: { height: 42, padding: '0 18px', borderRadius: 10, border: 0, background: '#d93f17', color: '#fff', font: '500 14px system-ui, sans-serif', cursor: 'pointer' },
  secondary: { height: 42, padding: '0 18px', borderRadius: 10, border: '1px solid #2e2e33', background: 'transparent', color: '#f4f2ee', font: '500 14px system-ui, sans-serif', cursor: 'pointer' },
  link: { marginLeft: 4, color: '#a7a5a0', fontSize: 14 },
}
