import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import Cursor from '@/components/site/Cursor'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
