import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Same monogram as app/icon.tsx, scaled up for iOS/Android home-screen
// bookmarks (no rounded corners here — the OS already applies its own
// mask/corner-radius to home-screen icons).
export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: 'sans-serif',
            fontWeight: 800,
            fontSize: 110,
            color: '#f0ede6',
            letterSpacing: -5,
          }}
        >
          S
          <span style={{ color: '#b8ff4f', fontSize: 110, marginLeft: 4 }}>.</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
