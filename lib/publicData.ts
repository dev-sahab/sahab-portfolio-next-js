import { cache } from 'react'
import connectDB from './mongodb'
import SiteSettingsModel from '@/models/SiteSettings'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
// Registered so populate('category')/populate('tags') below can resolve the
// ref — same reason every route/page that populates these already does this.
import '@/models/Category'
import '@/models/Tag'

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

export const getProjectBySlug = cache(async (slug: string) => {
  await connectDB()
  return Project.findOne({ slug, published: true }).populate('category').populate('tags').lean()
})

export const getBlogPostBySlug = cache(async (slug: string) => {
  await connectDB()
  return BlogPost.findOne({ slug, published: true }).populate('category').populate('tags').lean()
})
