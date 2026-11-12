import type { Metadata } from 'next'
import { site, socials } from '@/content/v8/site'
import { V8_BASE, absoluteUrl, routes } from './routes'

export const DEFAULT_OG_IMAGE = absoluteUrl('/og.png')

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
  // Pages without their own picture share the branded card (public/og.png, 1200×630).
  const images = image ? [{ url: image, alt: title }] : [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: `${site.name}, freelance web developer` }]
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
    twitter: { card: 'summary_large_image', title: `${title} · ${site.name}`, description, images: [images[0].url] },
    robots: IS_PREVIEW || noIndex ? { index: false, follow: !IS_PREVIEW } : undefined,
  }
}

// ── JSON-LD ──

const person = {
  '@type': 'Person',
  '@id': absoluteUrl(`${routes.about}#person`),
  name: site.name,
  alternateName: site.legalName,
  url: absoluteUrl(routes.about),
  image: absoluteUrl('/v8/portrait.jpg'),
  jobTitle: 'Freelance Web Developer',
  description: 'Freelance web developer building WordPress, WooCommerce and Webflow websites and custom web apps.',
  knowsAbout: [
    'Web development',
    'WordPress development',
    'WooCommerce',
    'Elementor',
    'Webflow',
    'Framer',
    'Web application development',
    'React',
    'Next.js',
    'Node.js',
    'Laravel',
    'PHP',
    'Technical SEO',
    'Website performance',
  ],
  sameAs: socials.filter((s) => s.href.startsWith('http')).map((s) => s.href),
  address: { '@type': 'PostalAddress', addressLocality: 'Sylhet', addressCountry: 'BD' },
}

/** Homepage: the site itself, owned by the person above. */
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': absoluteUrl(`${routes.home}#website`),
  name: `${site.name} · Freelance Web Developer`,
  url: absoluteUrl(routes.home),
  inLanguage: 'en',
  publisher: { '@id': person['@id'] },
})

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
