import type { Metadata } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import V8Providers from '@/components/v8/providers/V8Providers'
import Header from '@/components/v8/layout/Header'
import Footer from '@/components/v8/layout/Footer'
import '@/styles/v8/base.scss'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  axes: ['opsz'],
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument',
  display: 'swap',
})

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

const V8_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('v8-js');try{if(!localStorage.getItem('sahab-theme')){d.setAttribute('data-theme',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')}}catch(e){}})()`

export const metadata: Metadata = {
  title: { absolute: 'Sahab Uddin · Web developer' },
  description:
    'Sahab Uddin builds fast, SEO-friendly WordPress, Webflow and React websites. 300+ projects, 5.0 across 200+ reviews.',
  // Preview of the next homepage design — keep it out of search until it replaces `/`.
  robots: { index: false, follow: false },
}

/**
 * Standalone layout for the v8 homepage design. Sits outside the `(site)`
 * route group, so none of the current site's Navbar/Footer/Cursor load here,
 * and every style is scoped under `.v8` (see styles/v8/base.scss).
 */
export default function V8Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v8 ${bricolage.variable} ${instrumentSerif.variable} ${geist.variable} ${geistMono.variable}`} id="top">
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
