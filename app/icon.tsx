import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

// Default browser-tab favicon — replaces the generic Next.js starter icon.
// Mirrors the site's actual wordmark (Navbar's "Sahab." fallback logo, see
// components/site/Navbar.tsx) as a monogram: bold "S" + the same accent dot,
// on the site's own --bg/--accent colors so it reads as this brand at a
// glance even at 16-32px. Overridden automatically once a real favicon is
// uploaded via the dashboard's Settings > General tab (see the `icons`
// field in app/layout.tsx's generateMetadata — an explicit metadata icon
// always wins over this file-convention default).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: 'sans-serif',
            fontWeight: 800,
            fontSize: 21,
            color: '#f0ede6',
            letterSpacing: -1,
          }}
        >
          S
          <span style={{ color: '#b8ff4f', fontSize: 21, marginLeft: 1 }}>.</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
