import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import Cursor from '@/components/site/Cursor'
import TiltCards from '@/components/site/TiltCards'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <TiltCards />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
