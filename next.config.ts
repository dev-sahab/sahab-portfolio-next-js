import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
  },
  sassOptions: {
    // `sass-loader` forwards this to Dart Sass's modern API, which reads
    // `loadPaths` — `includePaths` is the legacy node-sass/renderSync name
    // and is silently ignored here, breaking bare `@use 'variables'` imports.
    loadPaths: [path.join(__dirname, 'styles')],
  },
  async headers() {
    // Baseline security headers (vibe-coding pre-deploy checklist, prompt 3
    // check #4) applied to every response. `next/font/google` self-hosts the
    // Syne/Outfit/JetBrains Mono files at build time, so unlike a typical
    // Google-Fonts `<link>` setup there's no runtime call to
    // fonts.googleapis.com/fonts.gstatic.com to allowlist here.
    //
    // `script-src` keeps 'unsafe-inline' because `app/layout.tsx` ships a
    // small inline script to apply the saved theme before paint (avoiding a
    // flash of the wrong theme) and Next itself inlines hydration data —
    // neither works with a strict script-src without wiring a per-request
    // nonce through `proxy.ts` into that script tag. This is still a real
    // restriction: it blocks an attacker from loading a *script from another
    // origin* (e.g. an injected `<script src="https://evil.example/x.js">`),
    // which is the specific case this check is guarding against.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://images.unsplash.com https://*.vercel.app",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')

    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Content-Security-Policy', value: csp },
    ]

    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
