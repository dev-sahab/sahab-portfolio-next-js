import type { MetadataRoute } from 'next'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shahabweb.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/portfolio`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/get-quote`, changeFrequency: 'yearly', priority: 0.5 },
  ]

  let dynamicPages: MetadataRoute.Sitemap = []
  try {
    await connectDB()
    const [projects, posts] = await Promise.all([
      Project.find({ published: true, noIndex: { $ne: true } }, 'slug updatedAt').lean(),
      BlogPost.find({ published: true }, 'slug updatedAt').lean(),
    ])
    dynamicPages = [
      ...(projects as any[]).map(p => ({
        url: `${baseUrl}/portfolio/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...(posts as any[]).map(p => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  } catch {}

  return [...staticPages, ...dynamicPages]
}
