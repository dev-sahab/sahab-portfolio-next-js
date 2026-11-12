import type { Metadata } from 'next'
import { site } from '@/content/v8/site'
import { V8_BASE, absoluteUrl, routes } from './routes'

/** True while v8 is a preview under /v8 — every page stays out of search until launch. */
export const IS_PREVIEW = V8_BASE !== ''

interface PageMetaInput {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  /** Hide this page from search even after launch (e.g. a project marked noIndex). */
  noIndex?: boolean
}

/**
 * Per-page metadata: title, description, canonical URL, Open Graph and
 * Twitter card. The title runs through the v8 layout's template
 * ("%s · Sahab Uddin").
 */
export function pageMetadata({ title, description, path, image, type = 'website', publishedTime, modifiedTime, noIndex }: PageMetaInput): Metadata {
  const url = absoluteUrl(path)
  const images = image ? [{ url: image, alt: title }] : undefined
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title: `${title} · ${site.name}`,
      description,
      siteName: site.name,
      locale: 'en_US',
      images,
      ...(type === 'article' ? { publishedTime, modifiedTime, authors: [site.name] } : {}),
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: `${title} · ${site.name}`, description, images: image ? [image] : undefined },
    robots: IS_PREVIEW || noIndex ? { index: false, follow: !IS_PREVIEW } : undefined,
  }
}

// ── JSON-LD ──

const person = {
  '@type': 'Person',
  '@id': absoluteUrl(`${routes.about}#person`),
  name: site.name,
  url: absoluteUrl(routes.about),
  jobTitle: 'Web developer',
  address: { '@type': 'PostalAddress', addressLocality: 'Sylhet', addressCountry: 'BD' },
}

export const personSchema = () => ({ '@context': 'https://schema.org', ...person })

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function articleSchema(post: { title: string; excerpt: string; slug: string; coverImage?: string; publishedAt: string; updatedAt: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@id': person['@id'], '@type': 'Person', name: site.name },
    mainEntityOfPage: absoluteUrl(routes.post(post.slug)),
  }
}

export function projectSchema(project: { title: string; summary: string; slug: string; image?: string; year: string; liveUrl?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    image: project.image || undefined,
    dateCreated: project.year || undefined,
    url: absoluteUrl(routes.project(project.slug)),
    sameAs: project.liveUrl,
    creator: { '@id': person['@id'], '@type': 'Person', name: site.name },
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function serviceSchema(items: { name: string; description: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'Service', name: item.name, description: item.description, url: absoluteUrl(item.url), provider: { '@id': person['@id'] } },
    })),
  }
}
