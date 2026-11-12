import type { Metadata } from 'next'
import { v8FontVars } from '@/lib/v8/fonts'
import V8Providers from '@/components/v8/providers/V8Providers'
import Header from '@/components/v8/layout/Header'
import Footer from '@/components/v8/layout/Footer'
import { SITE_URL, absoluteUrl, routes } from '@/lib/v8/routes'
import { IS_PREVIEW } from '@/lib/v8/seo'
import '@/styles/v8/base.scss'

const V8_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('v8-js');try{if(!localStorage.getItem('sahab-theme')){d.setAttribute('data-theme',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}}catch(e){}})()`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Inner pages set their own title ("Projects") and get " · Sahab Uddin" appended.
  title: { default: 'Sahab Uddin · Web developer', template: '%s · Sahab Uddin' },
  description:
    'Sahab Uddin builds fast, SEO-friendly WordPress, Webflow and React websites. 300+ projects, 5.0 across 200+ reviews.',
  alternates: { canonical: absoluteUrl(routes.home) },
  // Preview of the next site design — kept out of search until it replaces `/` (see lib/v8/seo.ts).
  robots: IS_PREVIEW ? { index: false, follow: false } : undefined,
}

/**
 * Standalone layout for the v8 homepage design. Sits outside the `(site)`
 * route group, so none of the current site's Navbar/Footer/Cursor load here,
 * and every style is scoped under `.v8` (see styles/v8/base.scss).
 */
export default function V8Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v8 ${v8FontVars}`} id="top">
      {/*
        Runs before paint: enables the scroll-reveal styles only when JS is on,
        and (Figma: theme toggle "defaults to the visitor's OS setting") picks
        the system theme when the visitor hasn't chosen one yet.
      */}
      <script dangerouslySetInnerHTML={{ __html: V8_BOOT_SCRIPT }} />
      <V8Providers>
        <a href="#main" className="v8-skip">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </V8Providers>
    </div>
  )
}
