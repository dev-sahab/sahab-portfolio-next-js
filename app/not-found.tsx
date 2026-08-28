import type { Metadata } from 'next'
import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import Cursor from '@/components/site/Cursor'
import TiltCards from '@/components/site/TiltCards'
import NotFoundContent from '@/components/site/NotFoundContent'
import { getSiteSettings } from '@/lib/publicData'
import type { SiteSettings } from '@/types'

export const metadata: Metadata = { title: 'Page Not Found' }

/**
 * Root-level fallback — Next 16 routes any URL that doesn't match a route at
 * all through this file (not just a notFound() call at the root segment),
 * so it never actually renders inside app/(site)/layout.tsx's Navbar/Footer.
 * A bad slug under an existing page (e.g. /portfolio/nonexistent) instead
 * hits app/(site)/not-found.tsx, which does get that chrome for free — this
 * file renders the same chrome manually so both cases look identical.
 */
export default async function NotFound() {
  const settings = (await getSiteSettings()) as SiteSettings | null
  return (
    <>
      <Cursor />
      <TiltCards />
      <Navbar settings={settings} />
      <main>
        <NotFoundContent />
      </main>
      <Footer settings={settings} />
    </>
  )
}
