import type { ReactNode } from 'react'
import { v8FontVars } from '@/lib/v8/fonts'
import V8Providers from '@/components/v8/providers/V8Providers'
import Header from './Header'
import Footer from './Footer'
import '@/styles/v8/base.scss'

const V8_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('v8-js');try{if(!localStorage.getItem('sahab-theme')){d.setAttribute('data-theme',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}}catch(e){}})()`

/**
 * The public site's frame: fonts, theme boot script, providers (toasts,
 * ⌘K, consent, smooth scroll), header, main and footer. Used by the
 * `app/(v8)` layout and by the root `app/not-found.tsx` (unmatched URLs
 * render outside every route group, so the 404 needs the frame itself).
 * Every style is scoped under `.v8` (styles/v8/base.scss).
 */
export default function V8Shell({ children }: { children: ReactNode }) {
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
