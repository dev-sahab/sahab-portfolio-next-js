import Navbar from '@/components/site/Navbar'
import Footer from '@/components/site/Footer'
import Cursor from '@/components/site/Cursor'
import TiltCards from '@/components/site/TiltCards'
import connectDB from '@/lib/mongodb'
import SiteSettingsModel from '@/models/SiteSettings'
import type { SiteSettings } from '@/types'

async function getSettings() {
  try {
    await connectDB()
    const settings = await SiteSettingsModel.findOne().lean()
    // Plain-serialize to strip ObjectId/Date instances Mongoose leaves behind —
    // Navbar is a Client Component and can only receive plain-object props.
    return settings ? (JSON.parse(JSON.stringify(settings)) as SiteSettings) : null
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
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
