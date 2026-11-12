import type { MetadataRoute } from 'next'
import { getPosts, getProjects } from '@/lib/v8/data'
import { absoluteUrl, routes } from '@/lib/v8/routes'

// Rebuilt hourly (and on dashboard edits, which revalidate the pages it lists).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  })

  const staticPages: MetadataRoute.Sitemap = [
    page(routes.home, 1, 'weekly'),
    page(routes.services, 0.9, 'monthly'),
    page(routes.projects, 0.9, 'weekly'),
    page(routes.about, 0.7, 'monthly'),
    page(routes.blog, 0.8, 'weekly'),
    page(routes.contact, 0.7, 'yearly'),
    page(routes.faq, 0.6, 'monthly'),
    page(routes.privacy, 0.2, 'yearly'),
    page(routes.terms, 0.2, 'yearly'),
    page(routes.cookies, 0.2, 'yearly'),
  ]

  const [projects, posts] = await Promise.all([getProjects(), getPosts()])
  return [
    ...staticPages,
    ...projects
      .filter((p) => !p.noIndex)
      .map((p) => ({ url: absoluteUrl(routes.project(p.slug)), lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: absoluteUrl(routes.post(p.slug)), lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]
}
