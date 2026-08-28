import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import Cursor from '@/components/site/Cursor'
import TiltCards from '@/components/site/TiltCards'
import { getSiteSettings } from '@/lib/publicData'
import type { SiteSettings } from '@/types'

export const revalidate = 3600

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = (await getSiteSettings()) as SiteSettings | null
  return (
    <>
      <Cursor />
      <TiltCards />
      <Navbar settings={settings} />
      {children}
      <Footer settings={settings} />
    </>
  )
}
