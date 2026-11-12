/**
 * Shared types for the v8 homepage's static content.
 *
 * Everything under `content/v8/` is plain data — no React, no fetching — so
 * the same shapes can later be swapped for CMS/Mongo-backed data without
 * touching the components that render them.
 */

/** Keys into the brand-icon registry in `lib/v8/tech.tsx`. */
export type TechKey =
  | 'wordpress'
  | 'elementor'
  | 'woocommerce'
  | 'crocoblock'
  | 'webflow'
  | 'framer'
  | 'wix'
  | 'php'
  | 'laravel'
  | 'tailwind'
  | 'gsap'
  | 'react'
  | 'nextjs'
  | 'nodejs'
  | 'mongodb'
  | 'mysql'
  | 'postgresql'
  | 'prisma'
  | 'figma'
  | 'make'
  | 'n8n'
  | 'stripe'
  | 'memberstack'
  | 'airtable'
  | 'javascript'
  | 'express'

export interface NavLink {
  label: string
  href: string
}

export interface SocialLink {
  kind: 'github' | 'linkedin' | 'email'
  label: string
  href: string
}

/**
 * Headline copy. Wrap words in `*asterisks*` to render them in the italic
 * serif accent; use `\n` for a deliberate line break (see `RichHeading`).
 */
export type HeadingText = string

export interface Project {
  slug: string
  title: string
  year: string
  category: string
  summary: string
  stack: TechKey[]
  /** Text shown in the fake browser address bar. */
  domain: string
  /** Full-page screenshot; scrolls inside the frame on hover. */
  image: string
  imageAlt: string
  caseStudyHref: string
  liveUrl?: string
  featured?: boolean
  /** Logo shown for this project in the ⌘K menu (defaults to the first stack item). */
  menuIcon?: TechKey
  /** Stack entries with no logo in the registry, shown as plain tags. */
  stackExtra?: string[]
}

/** A project as loaded from the CMS for the projects pages. */
export interface ProjectDetail extends Project {
  client?: string
  duration?: string
  githubUrl?: string
  /** Sanitised HTML from the dashboard editor. */
  content: string
  gallery: string[]
  createdAt?: string
  updatedAt?: string
}

export interface PostSummary {
  slug: string
  title: string
  excerpt: string
  coverImage?: string
  category: { name: string; slug: string } | null
  tags: { name: string; slug: string }[]
  /** ISO dates. */
  publishedAt: string
  updatedAt: string
  readTime: number
  featured: boolean
}

export interface PostDetail extends PostSummary {
  /** Sanitised HTML with ids on its h2 headings. */
  content: string
  toc: { id: string; text: string }[]
}

export interface Service {
  id: string
  variant: 'deep' | 'plain' | 'accent'
  /** The whole card links here (Figma Interaction 05). */
  href: string
  stack: TechKey[]
  title: string
  description: string
  features: string[]
  bestFor: string
  badge?: string
}

/** One syntax-highlighted run of text inside an editor line. */
export interface CodeToken {
  text: string
  tone?: 'keyword' | 'function' | 'var' | 'string' | 'comment' | 'accent' | 'ok' | 'strong'
}

export type CodeLine = CodeToken[]

export type ProcessView = 'design' | 'build' | 'grow'

export interface ProcessStep {
  id: string
  number: string
  title: string
  description: string
  view: ProcessView
  files: [active: string, secondary: string]
  lines: CodeLine[]
  footerNote: string
  status: string
}

export interface TimelineEntry {
  period: string
  role: string
  version: string
  current?: boolean
  org: string
  description: string
}

export interface Stat {
  value: string
  suffix?: string
  label: string
}

export interface Testimonial {
  quote: string
  name: string
  role: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}
