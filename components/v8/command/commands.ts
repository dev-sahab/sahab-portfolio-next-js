import { headerNav, sectionIds, site, socials } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { projects } from '@/content/v8/projects'
import { services } from '@/content/v8/services'
import type { TechKey } from '@/content/v8/types'

export type CommandAction =
  | { type: 'scroll'; target: string }
  | { type: 'link'; href: string; external?: boolean }
  | { type: 'copy'; value: string; message: string }
  | { type: 'theme' }

export type CommandGlyph = 'hash' | 'copy' | 'send' | 'theme' | 'github' | 'linkedin' | 'book'

export interface Command {
  id: string
  group: string
  label: string
  meta: string
  keywords: string
  icon: { tech: TechKey } | { glyph: CommandGlyph }
  action: CommandAction
}

const github = socials.find((s) => s.kind === 'github')!
const linkedin = socials.find((s) => s.kind === 'linkedin')!

/** Everything reachable from the ⌘K menu — built from the same static content as the page. */
export const commands: Command[] = [
  ...projects.map<Command>((p) => ({
    id: `project-${p.slug}`,
    group: 'Projects',
    label: p.title,
    meta: `${p.category} · ${p.year}`,
    keywords: `${p.summary} ${p.stack.join(' ')} ${p.domain}`,
    icon: { tech: p.menuIcon ?? p.stack[0] },
    action: { type: 'link', href: p.caseStudyHref },
  })),
  // "Stack" group, as in the HTML prototype — one entry per platform/service.
  ...services.map<Command>((s) => ({
    id: `service-${s.id}`,
    group: 'Stack',
    label: s.title.replace('\n', ' '),
    meta: s.features[0],
    keywords: `${s.description} ${s.features.join(' ')} ${s.stack.join(' ')} ${s.bestFor} services`,
    icon: { tech: s.stack[0] },
    action: { type: 'link', href: s.href },
  })),
  // Every page, so search doubles as site navigation.
  ...[{ label: 'Home', href: routes.home }, ...headerNav].map<Command>((page) => ({
    id: `page-${page.href}`,
    group: 'Pages',
    label: page.label,
    meta: page.href,
    keywords: `${page.label} page go open`,
    icon: { glyph: 'hash' },
    action: { type: 'link', href: page.href },
  })),
  // Order matches the HTML prototype: copy email, quote, GitHub, LinkedIn.
  {
    id: 'copy-email',
    group: 'Contact',
    label: 'Copy email address',
    meta: site.email,
    keywords: 'email mail contact copy',
    icon: { glyph: 'copy' },
    action: { type: 'copy', value: site.email, message: 'Email copied' },
  },
  {
    id: 'quote',
    group: 'Contact',
    label: 'Get a free quote',
    meta: 'Reply within 24 hours',
    keywords: 'quote price hire contact project form',
    icon: { glyph: 'send' },
    action: { type: 'scroll', target: sectionIds.contact },
  },
  {
    id: 'github',
    group: 'Contact',
    label: 'Open GitHub',
    meta: github.href.replace('https://', ''),
    keywords: 'github code repo',
    icon: { glyph: 'github' },
    action: { type: 'link', href: github.href, external: true },
  },
  {
    id: 'linkedin',
    group: 'Contact',
    label: 'Open LinkedIn',
    meta: linkedin.href.replace('https://', ''),
    keywords: 'linkedin social profile',
    icon: { glyph: 'linkedin' },
    action: { type: 'link', href: linkedin.href, external: true },
  },
]

export function filterCommands(query: string): Command[] {
  const q = query.trim().toLowerCase()
  if (!q) return commands
  const terms = q.split(/\s+/)
  return commands.filter((c) => {
    const haystack = `${c.label} ${c.meta} ${c.group} ${c.keywords}`.toLowerCase()
    return terms.every((t) => haystack.includes(t))
  })
}
