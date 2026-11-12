/**
 * Every v8 URL in one place.
 *
 * The v8 site is a preview under `/v8` until it replaces the current site.
 * To launch it at the root, set `V8_BASE` to '' (and move the route folders
 * out of `app/v8/`): every link, canonical URL and breadcrumb follows.
 */
export const V8_BASE: string = '/v8'

const at = (path: string) => `${V8_BASE}${path}` || '/'

export const routes = {
  home: V8_BASE || '/',
  about: at('/about'),
  services: at('/services'),
  service: (id: string) => `${at('/services')}#${id}`,
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

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://shahabweb.vercel.app').replace(/\/$/, '')

/** Absolute URL for canonical links, Open Graph and JSON-LD. */
export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
