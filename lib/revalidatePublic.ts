import { revalidatePath } from 'next/cache'

/**
 * Public pages are cached (see each app/(site) page's `export const
 * revalidate`) rather than force-dynamic, so a dashboard write needs to
 * explicitly tell Next which cached paths just went stale. One function per
 * content type, called from the matching API route(s) right after a
 * successful mutation — keeps "which paths does X affect" in one place
 * instead of repeated inline revalidatePath calls scattered across routes.
 */

export function revalidateProjects() {
  revalidatePath('/portfolio')
  revalidatePath('/portfolio/[slug]', 'page')
  revalidatePath('/')
}

export function revalidateBlog() {
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
  revalidatePath('/')
}

export function revalidateTestimonials() {
  revalidatePath('/')
}

export function revalidateSettings() {
  // Nav/footer/metadata come from SiteSettings and render on every page.
  revalidatePath('/', 'layout')
}

export function revalidateTaxonomy() {
  // Category/tag names & slugs show up on both listing and detail pages.
  revalidatePath('/portfolio')
  revalidatePath('/portfolio/[slug]', 'page')
  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
}
