import { cache } from 'react'
import connectDB from './mongodb'
import SiteSettingsModel from '@/models/SiteSettings'

/**
 * Public-site data fetchers shared across a layout + a page + generateMetadata
 * that would otherwise each independently query Mongo for the same document
 * within one request. Wrapped in React's `cache()`, which memoizes per
 * render pass — three call sites, one query.
 */

export const getSiteSettings = cache(async () => {
  try {
    await connectDB()
    const settings = await SiteSettingsModel.findOne().lean()
    // Plain-serialize to strip ObjectId/Date instances Mongoose leaves behind
    // — every consumer either passes this into a Client Component or reads
    // plain fields off it.
    return settings ? JSON.parse(JSON.stringify(settings)) : null
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
})
