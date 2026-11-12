import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  experimental: {
    // Next 15+ defaults the client Router Cache's `dynamic` staleTime to 0s
    // (down from 30s pre-15), so every dashboard nav — even back to a page
    // you were just on — re-fetches its full RSC payload. Restoring the old
    // default makes revisits within 30s instant. Mutations are unaffected:
    // ContentForm/DeleteButton/TaxonomyManager already call router.refresh()
    // after every write, which forces a fresh read regardless of this cache.
    staleTimes: { dynamic: 30, static: 180 },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
    // Uploaded images are content-immutable per URL — app/api/upload/route.ts's
    // buildPublicId() mints a fresh Cloudinary public_id (random suffix) on
    // every upload, so a given URL's bytes never change in place. Safe to
    // cache the optimizer's output for a long time (default is 4 hours).
    minimumCacheTTL: 31536000,
  },
  sassOptions: {
    // `sass-loader` forwards this to Dart Sass's modern API, which reads
    // `loadPaths` — `includePaths` is the legacy node-sass/renderSync name
    // and is silently ignored here, breaking bare `@use 'variables'` imports.
    loadPaths: [path.join(__dirname, 'styles')],
  },
  // Old URLs → their pages on the current site (permanent, so search engines
  // move their ranking over). /v8/* was the preview address of this design.
  async redirects() {
    return [
      { source: '/portfolio', destination: '/projects', permanent: true },
      { source: '/portfolio/:slug', destination: '/projects/:slug', permanent: true },
      { source: '/get-quote', destination: '/contact', permanent: true },
      { source: '/v8', destination: '/', permanent: true },
      // Only page paths: images in public/v8/ (logo, portrait…) must keep serving.
      {
        source: '/v8/:page(about|services|projects|blog|contact|faq|privacy|terms|cookies)/:rest*',
        destination: '/:page/:rest*',
        permanent: true,
      },
    ]
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
    // Dev only: webpack's dev build evaluates modules with `eval()`, so
    // without 'unsafe-eval' React never hydrates under `npm run dev` (every
    // click handler, menu, form is dead). Production builds don't use eval,
    // so the shipped policy stays strict.
    const isDev = process.env.NODE_ENV !== 'production'

    // Analytics / marketing tools (lib/v8/consent.ts): their domains are
    // allowed only when the tool's ID is set, and the scripts themselves
    // still load only after the visitor consents.
    const tools = {
      ga: Boolean(process.env.NEXT_PUBLIC_GA_ID),
      clarity: Boolean(process.env.NEXT_PUBLIC_CLARITY_ID),
      meta: Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID),
      ads: Boolean(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID),
      linkedin: Boolean(process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID),
    }
    const google = tools.ga || tools.ads
    const extra = (list: [boolean, string][]) =>
      list.filter(([on]) => on).map(([, domains]) => ` ${domains}`).join('')
    const toolScripts = extra([
      [google, 'https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net'],
      [tools.clarity, 'https://www.clarity.ms https://*.clarity.ms'],
      [tools.meta, 'https://connect.facebook.net'],
      [tools.linkedin, 'https://snap.licdn.com'],
    ])
    const toolConnect = extra([
      [google, 'https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com https://googleads.g.doubleclick.net https://*.doubleclick.net'],
      [tools.clarity, 'https://*.clarity.ms https://c.bing.com'],
      [tools.meta, 'https://www.facebook.com https://connect.facebook.net'],
      [tools.linkedin, 'https://px.ads.linkedin.com'],
    ])
    const toolImages = extra([
      [google, 'https://*.google-analytics.com https://www.googletagmanager.com https://www.google.com https://googleads.g.doubleclick.net https://*.doubleclick.net'],
      [tools.clarity, 'https://*.clarity.ms https://c.bing.com'],
      [tools.meta, 'https://www.facebook.com'],
      [tools.linkedin, 'https://px.ads.linkedin.com'],
    ])

    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${toolScripts}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://images.unsplash.com https://*.vercel.app${toolImages}`,
      "font-src 'self' data:",
      `connect-src 'self'${toolConnect}`,
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
