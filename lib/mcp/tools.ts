// Server-only: the tools the site's MCP server exposes to connected AI apps.
//
// Access model (chosen by Sahab): read everything, create and edit projects
// and blog posts (drafts unless `published: true` is passed), mark quote
// requests / contact messages read. Nothing can be deleted, and users,
// settings and media are out of reach. Every tool re-checks the caller's
// *current* dashboard role with lib/permissions on each call.
import { z } from 'zod'
import { Types } from 'mongoose'
import connectDB from '@/lib/mongodb'
import ProjectModel from '@/models/Project'
import BlogPostModel from '@/models/BlogPost'
import CategoryModel from '@/models/Category'
import TagModel from '@/models/Tag'
import QuoteRequestModel from '@/models/QuoteRequest'
import ContactModel from '@/models/Contact'
import { can, canWriteContent } from '@/lib/permissions'
import { resolveTagIds } from '@/lib/taxonomy'
import { calculateReadTime, slugify } from '@/lib/utils'
import { revalidateBlog, revalidateProjects } from '@/lib/revalidatePublic'
import { absoluteUrl, routes } from '@/lib/v8/routes'
import type { McpCaller } from '@/lib/oauth'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = Record<string, any>

export class ToolError extends Error {}

export interface ToolDef {
  name: string
  title: string
  description: string
  input: z.ZodObject<any>
  /** Read-only tools never change data (MCP annotation). */
  readOnly: boolean
  /** Who may call it at all; finer checks happen inside. */
  allowed: (role: string) => boolean
  run: (args: any, caller: McpCaller) => Promise<unknown>
}

const plain = <T,>(v: T): T => JSON.parse(JSON.stringify(v))
const idOrSlug = z.string().min(1).max(200).describe('The item’s id or its URL slug')
const limit = z.number().int().min(1).max(100).optional().describe('How many to return (default 20, max 100)')

/** Finds a document by ObjectId or slug. */
async function findOne(model: any, key: string) {
  const query = Types.ObjectId.isValid(key) ? { $or: [{ _id: key }, { slug: key }] } : { slug: key }
  return model.findOne(query)
}

/** Category by name or slug for the given type; a clear error lists the options. */
async function resolveCategory(value: string, type: 'project' | 'blog') {
  const slug = slugify(value)
  const cat = await CategoryModel.findOne({ type, $or: [{ slug }, { name: new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] })
  if (cat) return cat._id
  const all = (await CategoryModel.find({ type }, 'name').lean()) as Doc[]
  throw new ToolError(`Unknown ${type} category "${value}". Available: ${all.map((c) => c.name).join(', ') || 'none yet (create one in the dashboard)'}.`)
}

async function uniqueSlug(model: any, base: string) {
  const root = slugify(base) || 'untitled'
  let slug = root
  for (let i = 2; await model.exists({ slug }); i++) slug = `${root}-${i}`
  return slug
}

const projectSummary = (p: Doc) => ({
  id: String(p._id),
  title: p.title,
  slug: p.slug,
  status: p.published ? 'published' : 'draft',
  featured: Boolean(p.featured),
  category: p.category?.name ?? null,
  year: p.year,
  stack: p.stack ?? [],
  liveUrl: p.liveUrl ?? null,
  url: p.published ? absoluteUrl(routes.project(p.slug)) : null,
  updatedAt: p.updatedAt,
})

const postSummary = (p: Doc) => ({
  id: String(p._id),
  title: p.title,
  slug: p.slug,
  status: p.published ? 'published' : 'draft',
  featured: Boolean(p.featured),
  category: p.category?.name ?? null,
  tags: (p.tags ?? []).map((t: Doc) => t?.name).filter(Boolean),
  excerpt: p.excerpt,
  url: p.published ? absoluteUrl(routes.post(p.slug)) : null,
  updatedAt: p.updatedAt,
})

// Editable fields. Slugs can't be changed here: renaming a live URL breaks links (do it in the dashboard).
const projectFields = {
  title: z.string().min(2).max(200),
  excerpt: z.string().min(10).max(600).describe('Short summary shown on cards and in Google'),
  content: z.string().max(100_000).optional().describe('Write-up as HTML (p, h2, h3, ul/ol, li, a, strong, em, blockquote, code)'),
  category: z.string().min(1).max(100).describe('Project category name or slug (see list_categories)'),
  stack: z.array(z.string().min(1).max(40)).max(20).optional().describe('Platforms, e.g. ["WordPress", "Elementor"]'),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  liveUrl: z.string().url().max(500).optional(),
  githubUrl: z.string().url().max(500).optional(),
  coverImage: z.string().url().max(1000).optional().describe('Feature image URL (Cloudinary)'),
  screenshot: z.string().url().max(1000).optional().describe('Full-page screenshot URL; fades in and scrolls on hover'),
  client: z.string().max(120).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  duration: z.string().max(60).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional().describe('Leave out (or false) to save as a draft'),
}
const postFields = {
  title: z.string().min(2).max(200),
  excerpt: z.string().min(10).max(600).describe('Short summary shown on cards and in Google'),
  content: z.string().min(20).max(200_000).describe('Article body as HTML (p, h2, h3, ul/ol, li, a, strong, em, blockquote, code, pre)'),
  category: z.string().min(1).max(100).describe('Blog category name or slug (see list_categories)'),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  coverImage: z.string().url().max(1000).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional().describe('Leave out (or false) to save as a draft'),
}

const canAny = (...perms: string[]) => (role: string) => perms.some((p) => can(role, p))
const httpOnly = (v?: string) => (v && /^https?:\/\//i.test(v) ? v : undefined)

export const TOOLS: ToolDef[] = [
  {
    name: 'site_overview',
    title: 'Site overview',
    description: 'Counts of projects and posts (published/draft) and unread quote requests and messages. A good first call.',
    input: z.object({}),
    readOnly: true,
    allowed: canAny('projects.read', 'blog.read', 'quotes.read', 'contacts.read'),
    async run(_args, caller) {
      await connectDB()
      const [projects, projectsLive, posts, postsLive, quotesUnread, contactsUnread] = await Promise.all([
        ProjectModel.countDocuments(),
        ProjectModel.countDocuments({ published: true }),
        BlogPostModel.countDocuments(),
        BlogPostModel.countDocuments({ published: true }),
        can(caller.role, 'quotes.read') ? QuoteRequestModel.countDocuments({ read: false }) : null,
        can(caller.role, 'contacts.read') ? ContactModel.countDocuments({ read: false }) : null,
      ])
      return {
        site: absoluteUrl('/'),
        yourRole: caller.role,
        projects: { total: projects, published: projectsLive, drafts: projects - projectsLive },
        blogPosts: { total: posts, published: postsLive, drafts: posts - postsLive },
        unreadQuoteRequests: quotesUnread,
        unreadContactMessages: contactsUnread,
      }
    },
  },

  // ── Projects ──
  {
    name: 'list_projects',
    title: 'List projects',
    description: 'List portfolio projects, newest first. Filter by status or search the title.',
    input: z.object({ status: z.enum(['all', 'published', 'draft']).optional(), search: z.string().max(100).optional(), limit }),
    readOnly: true,
    allowed: canAny('projects.read'),
    async run({ status = 'all', search, limit = 20 }) {
      await connectDB()
      const q: Doc = {}
      if (status !== 'all') q.published = status === 'published'
      if (search) q.title = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      const docs = await ProjectModel.find(q).sort({ createdAt: -1 }).limit(limit).populate('category').lean()
      return { projects: plain(docs).map(projectSummary) }
    },
  },
  {
    name: 'get_project',
    title: 'Get a project',
    description: 'Full details of one project, including its HTML write-up.',
    input: z.object({ id_or_slug: idOrSlug }),
    readOnly: true,
    allowed: canAny('projects.read'),
    async run({ id_or_slug }) {
      await connectDB()
      const doc = await (await findOne(ProjectModel, id_or_slug))?.populate(['category', 'tags'])
      if (!doc) throw new ToolError(`No project "${id_or_slug}".`)
      const p = plain(doc.toObject())
      return { ...projectSummary(p), excerpt: p.excerpt, content: p.content, client: p.client, duration: p.duration, coverImage: p.coverImage, screenshot: p.screenshot, gallery: p.gallery, tags: (p.tags ?? []).map((t: Doc) => t.name) }
    },
  },
  {
    name: 'create_project',
    title: 'Create a project',
    description: 'Add a portfolio project. Saved as a draft unless published is true.',
    input: z.object(projectFields),
    readOnly: false,
    allowed: canAny('projects.write'),
    async run(args) {
      await connectDB()
      const doc = await ProjectModel.create({
        ...args,
        liveUrl: httpOnly(args.liveUrl),
        githubUrl: httpOnly(args.githubUrl),
        coverImage: httpOnly(args.coverImage),
        screenshot: httpOnly(args.screenshot),
        published: args.published === true,
        slug: await uniqueSlug(ProjectModel, args.title),
        category: await resolveCategory(args.category, 'project'),
        tags: args.tags ? await resolveTagIds(args.tags, 'project') : [],
      })
      revalidateProjects()
      const p = plain((await doc.populate('category')).toObject())
      return { created: projectSummary(p), editInDashboard: absoluteUrl(`/dashboard/projects/${p._id}`) }
    },
  },
  {
    name: 'update_project',
    title: 'Update a project',
    description: 'Change some fields of a project. Only the fields you pass are changed. The URL slug can’t be changed here.',
    input: z.object({ id_or_slug: idOrSlug, ...Object.fromEntries(Object.entries(projectFields).map(([k, v]) => [k, (v as z.ZodTypeAny).optional()])) }),
    readOnly: false,
    allowed: canAny('projects.write'),
    async run({ id_or_slug, ...changes }) {
      await connectDB()
      const doc = await findOne(ProjectModel, id_or_slug)
      if (!doc) throw new ToolError(`No project "${id_or_slug}".`)
      const set: Doc = { ...changes }
      if ('category' in set) set.category = await resolveCategory(set.category, 'project')
      if ('tags' in set) set.tags = await resolveTagIds(set.tags, 'project')
      for (const k of ['liveUrl', 'githubUrl', 'coverImage', 'screenshot']) if (k in set) set[k] = httpOnly(set[k])
      doc.set(set)
      await doc.save()
      revalidateProjects()
      return { updated: projectSummary(plain((await doc.populate('category')).toObject())), changedFields: Object.keys(changes) }
    },
  },

  // ── Blog ──
  {
    name: 'list_posts',
    title: 'List blog posts',
    description: 'List blog posts, newest first. Filter by status or search the title.',
    input: z.object({ status: z.enum(['all', 'published', 'draft']).optional(), search: z.string().max(100).optional(), limit }),
    readOnly: true,
    allowed: canAny('blog.read'),
    async run({ status = 'all', search, limit = 20 }) {
      await connectDB()
      const q: Doc = {}
      if (status !== 'all') q.published = status === 'published'
      if (search) q.title = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      const docs = await BlogPostModel.find(q).sort({ createdAt: -1 }).limit(limit).populate('category').populate('tags').lean()
      return { posts: plain(docs).map(postSummary) }
    },
  },
  {
    name: 'get_post',
    title: 'Get a blog post',
    description: 'Full details of one blog post, including its HTML content.',
    input: z.object({ id_or_slug: idOrSlug }),
    readOnly: true,
    allowed: canAny('blog.read'),
    async run({ id_or_slug }) {
      await connectDB()
      const doc = await (await findOne(BlogPostModel, id_or_slug))?.populate(['category', 'tags'])
      if (!doc) throw new ToolError(`No post "${id_or_slug}".`)
      const p = plain(doc.toObject())
      return { ...postSummary(p), content: p.content, coverImage: p.coverImage, readTime: p.readTime }
    },
  },
  {
    name: 'create_post',
    title: 'Create a blog post',
    description: 'Write a new blog post. Saved as a draft unless published is true (and your role may publish).',
    input: z.object(postFields),
    readOnly: false,
    allowed: canAny('blog.write', 'blog.write.own', 'blog.write.own.draft'),
    async run(args, caller) {
      if (!canWriteContent(caller.role, 'blog', { isOwner: true, publishing: args.published === true })) {
        throw new ToolError('Your role can’t publish posts. Save it as a draft (leave published out) and an editor can publish it.')
      }
      await connectDB()
      const doc = await BlogPostModel.create({
        ...args,
        coverImage: httpOnly(args.coverImage),
        published: args.published === true,
        slug: await uniqueSlug(BlogPostModel, args.title),
        category: await resolveCategory(args.category, 'blog'),
        tags: args.tags ? await resolveTagIds(args.tags, 'blog') : [],
        readTime: calculateReadTime(args.content.replace(/<[^>]+>/g, ' ')),
        author: Types.ObjectId.isValid(caller.userId) ? caller.userId : undefined,
      })
      revalidateBlog()
      const p = plain((await doc.populate(['category', 'tags'])).toObject())
      return { created: postSummary(p), editInDashboard: absoluteUrl(`/dashboard/blog/${p._id}`) }
    },
  },
  {
    name: 'update_post',
    title: 'Update a blog post',
    description: 'Change some fields of a post. Only the fields you pass are changed. The URL slug can’t be changed here.',
    input: z.object({ id_or_slug: idOrSlug, ...Object.fromEntries(Object.entries(postFields).map(([k, v]) => [k, (v as z.ZodTypeAny).optional()])) }),
    readOnly: false,
    allowed: canAny('blog.write', 'blog.write.own', 'blog.write.own.draft'),
    async run({ id_or_slug, ...changes }, caller) {
      await connectDB()
      const doc = await findOne(BlogPostModel, id_or_slug)
      if (!doc) throw new ToolError(`No post "${id_or_slug}".`)
      const isOwner = Boolean(doc.author) && String(doc.author) === caller.userId
      const publishing = changes.published === true || (doc.published && changes.published !== false)
      if (!canWriteContent(caller.role, 'blog', { isOwner, publishing })) throw new ToolError('Your role can’t edit this post.')
      const set: Doc = { ...changes }
      if ('category' in set) set.category = await resolveCategory(set.category, 'blog')
      if ('tags' in set) set.tags = await resolveTagIds(set.tags, 'blog')
      if ('coverImage' in set) set.coverImage = httpOnly(set.coverImage)
      if (typeof set.content === 'string') set.readTime = calculateReadTime(set.content.replace(/<[^>]+>/g, ' '))
      doc.set(set)
      await doc.save()
      revalidateBlog()
      return { updated: postSummary(plain((await doc.populate(['category', 'tags'])).toObject())), changedFields: Object.keys(changes) }
    },
  },

  // ── Taxonomy ──
  {
    name: 'list_categories',
    title: 'List categories',
    description: 'Categories for projects or blog posts (use their names in create/update calls).',
    input: z.object({ type: z.enum(['project', 'blog']) }),
    readOnly: true,
    allowed: canAny('categories.read', 'projects.read', 'blog.read'),
    async run({ type }) {
      await connectDB()
      const docs = (await CategoryModel.find({ type }, 'name slug').sort({ name: 1 }).lean()) as Doc[]
      return { categories: docs.map((c) => ({ name: c.name, slug: c.slug })) }
    },
  },
  {
    name: 'list_tags',
    title: 'List tags',
    description: 'Existing tags for projects or blog posts. New tag names are created automatically when used.',
    input: z.object({ type: z.enum(['project', 'blog']) }),
    readOnly: true,
    allowed: canAny('tags.read', 'projects.read', 'blog.read'),
    async run({ type }) {
      await connectDB()
      const docs = (await TagModel.find({ type }, 'name').sort({ name: 1 }).lean()) as Doc[]
      return { tags: docs.map((t) => t.name) }
    },
  },

  // ── Leads ──
  {
    name: 'list_quote_requests',
    title: 'List quote requests',
    description: 'Quote requests from the website form, newest first.',
    input: z.object({ unread_only: z.boolean().optional(), limit }),
    readOnly: true,
    allowed: canAny('quotes.read'),
    async run({ unread_only, limit = 20 }) {
      await connectDB()
      const docs = (await QuoteRequestModel.find(unread_only ? { read: false } : {}).sort({ createdAt: -1 }).limit(limit).lean()) as Doc[]
      return {
        quoteRequests: plain(docs).map((q: Doc) => ({
          id: String(q._id),
          name: q.name,
          email: q.email,
          service: q.service,
          platform: q.platform ?? null,
          websiteType: q.websiteType ?? null,
          pages: q.pages ?? null,
          design: q.uiux ?? null,
          features: q.features ?? [],
          timeline: q.timeline ?? null,
          estimatedTimeline: q.estimatedTimeline ?? null,
          website: q.url ?? null,
          message: q.notes ?? '',
          read: Boolean(q.read),
          receivedAt: q.createdAt,
        })),
      }
    },
  },
  {
    name: 'set_quote_request_read',
    title: 'Mark a quote request read',
    description: 'Mark a quote request as read or unread.',
    input: z.object({ id: z.string().refine((v) => Types.ObjectId.isValid(v), 'Not a valid id'), read: z.boolean() }),
    readOnly: false,
    allowed: canAny('quotes.read'),
    async run({ id, read }) {
      await connectDB()
      const res = await QuoteRequestModel.updateOne({ _id: id }, { $set: { read } })
      if (!res.matchedCount) throw new ToolError(`No quote request ${id}.`)
      return { id, read }
    },
  },
  {
    name: 'list_contact_messages',
    title: 'List contact messages',
    description: 'Messages from the contact form, newest first.',
    input: z.object({ unread_only: z.boolean().optional(), limit }),
    readOnly: true,
    allowed: canAny('contacts.read'),
    async run({ unread_only, limit = 20 }) {
      await connectDB()
      const docs = (await ContactModel.find(unread_only ? { read: false } : {}).sort({ createdAt: -1 }).limit(limit).lean()) as Doc[]
      return {
        messages: plain(docs).map((m: Doc) => ({
          id: String(m._id),
          name: m.name,
          email: m.email,
          subject: m.subject ?? null,
          budget: m.budget ?? null,
          message: m.message,
          read: Boolean(m.read),
          receivedAt: m.createdAt,
        })),
      }
    },
  },
  {
    name: 'set_contact_message_read',
    title: 'Mark a contact message read',
    description: 'Mark a contact message as read or unread.',
    input: z.object({ id: z.string().refine((v) => Types.ObjectId.isValid(v), 'Not a valid id'), read: z.boolean() }),
    readOnly: false,
    allowed: canAny('contacts.read'),
    async run({ id, read }) {
      await connectDB()
      const res = await ContactModel.updateOne({ _id: id }, { $set: { read } })
      if (!res.matchedCount) throw new ToolError(`No contact message ${id}.`)
      return { id, read }
    },
  },

  // ── Analytics ──
  {
    name: 'get_analytics',
    title: 'Site analytics',
    description: 'Visitors, page views, top pages and traffic sources (Google Analytics) plus Google search clicks, impressions and top queries (Search Console).',
    input: z.object({ days: z.union([z.literal(7), z.literal(28), z.literal(90)]).optional().describe('Period: 7, 28 (default) or 90 days') }),
    readOnly: true,
    allowed: canAny('analytics.read'),
    async run({ days = 28 }) {
      const [{ getGa4 }, { getSearchConsole }] = await Promise.all([import('@/lib/analytics/ga4'), import('@/lib/analytics/searchConsole')])
      const [ga4, gsc] = await Promise.all([getGa4(days), getSearchConsole(days)])
      return {
        periodDays: days,
        googleAnalytics:
          ga4.status === 'ok'
            ? { totals: ga4.data.totals, topPages: ga4.data.topPages, trafficSources: ga4.data.channels, countries: ga4.data.countries, devices: ga4.data.devices }
            : ga4.status === 'not-configured'
              ? { notConfigured: true, missing: ga4.missing }
              : { error: ga4.message },
        searchConsole:
          gsc.status === 'ok'
            ? { totals: gsc.data.totals, previousPeriod: gsc.data.previous, topQueries: gsc.data.queries, topPages: gsc.data.pages }
            : gsc.status === 'not-configured'
              ? { notConfigured: true, missing: gsc.missing }
              : { error: gsc.message },
      }
    },
  },
]
