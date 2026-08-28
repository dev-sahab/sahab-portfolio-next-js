import connectDB from '@/lib/mongodb'
import SiteSettingsModel from '@/models/SiteSettings'
import SettingsClient from '@/components/dashboard/SettingsClient'
import type { SiteSettings } from '@/types'

export default async function SettingsPage() {
  await connectDB()
  let settings = await SiteSettingsModel.findOne().lean()
  if (!settings) settings = (await SiteSettingsModel.create({})).toObject()
  const initialSettings = JSON.parse(JSON.stringify(settings)) as SiteSettings

  return <SettingsClient initialSettings={initialSettings} />
}
