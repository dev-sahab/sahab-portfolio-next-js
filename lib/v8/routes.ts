/**
 * Every public URL in one place. The site lives at the root (`app/(v8)`);
 * `V8_BASE` is kept so the whole site could be moved under a prefix again
 * by changing one value (links, canonicals and breadcrumbs follow).
 */
export const V8_BASE: string = ''

const at = (path: string) => `${V8_BASE}${path}` || '/'

export const routes = {
  home: V8_BASE || '/',
  about: at('/about'),
  services: at('/services'),
  service: (id: string) => `${at('/services')}#${id}`,
  /** Dedicated landing page per service (content/v8/servicePages.ts). */
  servicePage: (slug: string) => at(`/services/${slug}`),
  projects: at('/projects'),
  project: (slug: string) => at(`/projects/${slug}`),
  blog: at('/blog'),
  post: (slug: string) => at(`/blog/${slug}`),
  contact: at('/contact'),
  faq: at('/faq'),
  privacy: at('/privacy'),
  terms: at('/terms'),
  cookies: at('/cookies'),
  /** A section on the homepage, e.g. `homeSection('contact')`. */
  homeSection: (id: string) => `${V8_BASE || '/'}#${id}`,
} as const

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sahabuddin.me').replace(/\/$/, '')

/** Absolute URL for canonical links, Open Graph and JSON-LD. */
export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
