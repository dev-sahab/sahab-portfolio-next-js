import { revalidatePath } from 'next/cache'
import { routes } from '@/lib/v8/routes'

/**
 * Public pages are statically cached (`export const revalidate` in each
 * app/(v8) page), so a dashboard write tells Next which cached paths just
 * went stale. One function per content type, called from the matching API
 * route(s) right after a successful mutation.
 */

export function revalidateProjects() {
  revalidatePath(routes.projects)
  revalidatePath(`${routes.projects}/[slug]`, 'page')
  revalidatePath('/sitemap.xml')
}

export function revalidateBlog() {
  revalidatePath(routes.blog)
  revalidatePath(`${routes.blog}/[slug]`, 'page')
  revalidatePath('/sitemap.xml')
}

export function revalidateTestimonials() {
  revalidatePath(routes.home)
}

export function revalidateSettings() {
  // Settings (e.g. blog columns, favicon) can affect any page.
  revalidatePath('/', 'layout')
}

export function revalidateTaxonomy() {
  // Category/tag names show on listing and detail pages.
  revalidateProjects()
  revalidateBlog()
}
