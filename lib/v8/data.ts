import { cache } from 'react'
import connectDB from '@/lib/mongodb'
import ProjectModel from '@/models/Project'
import BlogPostModel from '@/models/BlogPost'
// Registered so populate('category') / populate('tags') can resolve.
import '@/models/Category'
import '@/models/Tag'
import { sanitizeContent } from '@/lib/sanitize'
import { calculateReadTime } from '@/lib/utils'
import type { PostDetail, PostSummary, ProjectDetail } from '@/content/v8/types'
import { toTechKeys } from './tech'
import { routes } from './routes'

/**
 * CMS data for the v8 pages (projects + blog), shaped for the v8 components.
 *
 * Every fetcher is wrapped in React `cache()` so a page and its
 * `generateMetadata` share one query per request, and returns plain JSON
 * (no ObjectIds / Dates), so results can go straight into Client Components.
 * Pages using these are statically cached (`revalidate`) and refreshed on
 * dashboard writes by lib/revalidatePublic.ts.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = Record<string, any>

const plain = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

/**
 * Only http(s) URLs from the CMS are allowed into links and images, so a
 * `javascript:` or `data:` value saved in the dashboard can never run on
 * the public site.
 */
function safeUrl(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : undefined
  } catch {
    return undefined
  }
}

function hostOf(url?: string) {
  if (!url) return undefined
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')

/**
 * Sanitises CMS HTML and swaps the editor's non-breaking spaces for normal
 * ones — Quill stores runs of `&nbsp;`, which turn whole paragraphs into
 * one unbreakable "word" that wraps mid-word on narrow screens.
 */
const cleanHtml = (html: string) => sanitizeContent(html.replace(/&nbsp;|\u00a0/g, ' '))

function toProject(doc: Doc): ProjectDetail {
  const { keys, extra } = toTechKeys(doc.stack ?? [])
  const liveUrl = safeUrl(doc.liveUrl)
  const year = doc.year ?? (doc.createdAt ? new Date(doc.createdAt).getFullYear() : '')
  return {
    slug: doc.slug,
    title: doc.title,
    year: String(year),
    category: doc.category?.name ?? 'Website',
    summary: doc.excerpt ?? '',
    stack: keys,
    stackExtra: extra,
    domain: hostOf(liveUrl) ?? doc.slug,
    image: safeUrl(doc.coverImage) ?? '',
    imageAlt: `${doc.title} website`,
    caseStudyHref: routes.project(doc.slug),
    liveUrl,
    githubUrl: safeUrl(doc.githubUrl),
    featured: Boolean(doc.featured),
    noIndex: Boolean(doc.noIndex),
    client: doc.client || undefined,
    duration: doc.duration || undefined,
    content: doc.content ? cleanHtml(doc.content) : '',
    gallery: (doc.gallery ?? []).map((u: string) => safeUrl(u)).filter((u: string | undefined): u is string => Boolean(u)),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

/** Published projects, featured first then newest (`noIndex` ones stay on the page, only the sitemap skips them). */
export const getProjects = cache(async (): Promise<ProjectDetail[]> => {
  try {
    await connectDB()
    const docs = await ProjectModel.find({ published: true })
      .sort({ featured: -1, createdAt: -1 })
      .populate('category')
      .lean()
    return plain((docs as Doc[]).map(toProject))
  } catch (error) {
    console.error('[v8] getProjects failed:', error)
    return []
  }
})

export const getProject = cache(async (slug: string): Promise<(ProjectDetail & { noIndex: boolean }) | null> => {
  try {
    await connectDB()
    const doc = (await ProjectModel.findOne({ slug, published: true }).populate('category').lean()) as Doc | null
    return doc ? plain({ ...toProject(doc), noIndex: Boolean(doc.noIndex) }) : null
  } catch (error) {
    console.error('[v8] getProject failed:', error)
    return null
  }
})

// ── Blog ──

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/gi, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 64)

function toPostSummary(doc: Doc): PostSummary {
  const words = doc.content ? calculateReadTime(stripHtml(doc.content)) : 1
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? '',
    coverImage: safeUrl(doc.coverImage),
    category: doc.category ? { name: doc.category.name, slug: doc.category.slug } : null,
    tags: (doc.tags ?? []).filter((t: Doc) => t?.name).map((t: Doc) => ({ name: t.name, slug: t.slug })),
    publishedAt: doc.createdAt,
    updatedAt: doc.updatedAt ?? doc.createdAt,
    // The stored readTime is often the default (1); prefer the real count.
    readTime: Math.max(words, Number(doc.readTime) || 1),
    featured: Boolean(doc.featured),
  }
}

/** Adds ids to <h2>s (for the table of contents / deep links) and returns the list. */
function withHeadingIds(html: string) {
  const toc: { id: string; text: string }[] = []
  const used = new Set<string>()
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs: string, inner: string) => {
    const text = stripHtml(inner).replace(/\s+/g, ' ').trim()
    if (!text) return `<h2${attrs}>${inner}</h2>`
    let id = slugify(text) || `section-${toc.length + 1}`
    while (used.has(id)) id = `${id}-${toc.length + 1}`
    used.add(id)
    toc.push({ id, text })
    return `<h2${attrs.replace(/\sid="[^"]*"/i, '')} id="${id}">${inner}</h2>`
  })
  return { html: out, toc }
}

export const getPosts = cache(async (): Promise<PostSummary[]> => {
  try {
    await connectDB()
    const docs = await BlogPostModel.find({ published: true })
      .sort({ createdAt: -1 })
      .populate('category')
      .populate('tags')
      .lean()
    return plain((docs as Doc[]).map(toPostSummary))
  } catch (error) {
    console.error('[v8] getPosts failed:', error)
    return []
  }
})

export const getPost = cache(async (slug: string): Promise<PostDetail | null> => {
  try {
    await connectDB()
    const doc = (await BlogPostModel.findOne({ slug, published: true })
      .populate('category')
      .populate('tags')
      .lean()) as Doc | null
    if (!doc) return null
    const { html, toc } = withHeadingIds(cleanHtml(doc.content ?? ''))
    return plain({ ...toPostSummary(doc), content: html, toc })
  } catch (error) {
    console.error('[v8] getPost failed:', error)
    return null
  }
})
