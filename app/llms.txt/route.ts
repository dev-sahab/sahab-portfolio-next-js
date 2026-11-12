import { servicePages } from '@/content/v8/servicePages'
import { getPosts, getProjects } from '@/lib/v8/data'
import { absoluteUrl, routes } from '@/lib/v8/routes'

/**
 * /llms.txt (https://llmstxt.org): a short, plain map of the site for AI
 * assistants such as ChatGPT search, Perplexity and Claude. Google ignores
 * it. Rebuilt hourly so new projects and posts show up.
 */
export const revalidate = 3600

const oneLine = (text: string, max = 160) => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1).replace(/\s+\S*$/, '')}…` : flat
}

export async function GET() {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()])

  const lines = [
    '# Sahab Uddin, freelance web developer',
    '',
    '> Freelance web developer building WordPress, WooCommerce, Webflow and Next.js websites and web apps for businesses and agencies. 300+ projects delivered since 2021, rated 5.0 across 200+ reviews. Fixed quotes, a reply within 24 hours, and support after launch.',
    '',
    'Sahab Uddin works with clients in the US, UK and Europe as one point of contact, bringing in partners for UI/UX design, SEO and marketing.',
    '',
    '## Services',
    '',
    `- [All web development services](${absoluteUrl(routes.services)}): overview, process and pricing approach`,
    ...servicePages.map((s) => `- [${s.eyebrow}](${absoluteUrl(routes.servicePage(s.slug))}): ${oneLine(s.metaDescription)}`),
    '',
    '## Work',
    '',
    `- [Portfolio](${absoluteUrl(routes.projects)}): live client websites`,
    ...projects.map((p) => `- [${p.title}](${absoluteUrl(routes.project(p.slug))}): ${oneLine(p.summary)}`),
    '',
    '## Blog',
    '',
    ...posts.map((p) => `- [${p.title}](${absoluteUrl(routes.post(p.slug))}): ${oneLine(p.excerpt)}`),
    '',
    '## About and contact',
    '',
    `- [About Sahab Uddin](${absoluteUrl(routes.about)}): background, roles and how projects run`,
    `- [FAQ](${absoluteUrl(routes.faq)}): cost, timelines, platforms and support`,
    `- [Contact](${absoluteUrl(routes.contact)}): request a fixed quote`,
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
