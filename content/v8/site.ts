import { routes } from '@/lib/v8/routes'
import type { NavLink, SocialLink } from './types'

/** Site-wide identity + navigation for the v8 layout (header, footer, ⌘K menu). */
export const site = {
  name: 'Sahab Uddin',
  legalName: 'Sahab Uddin Mintu',
  role: '/ full-stack web developer',
  email: 'frshahab.me@gmail.com',
  location: 'Sylhet, Bangladesh',
  year: 2026,
} as const

/** Section anchors on the v8 page — ids must match the `<section id>`s. */
export const sectionIds = {
  work: 'work',
  services: 'services',
  about: 'about',
  reviews: 'reviews',
  faq: 'faq',
  contact: 'contact',
} as const

/**
 * Primary navigation, in the order a visitor decides: what you offer →
 * proof → who you are → reading → questions → contact.
 */
export const headerNav: NavLink[] = [
  { label: 'Services', href: routes.services },
  { label: 'Work', href: routes.projects },
  { label: 'About', href: routes.about },
  { label: 'Blog', href: routes.blog },
  { label: 'FAQ', href: routes.faq },
  { label: 'Contact', href: routes.contact },
]

/** Footer link columns (components/v8/layout/Footer.tsx). */
export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: routes.home },
      { label: 'Services', href: routes.services },
      { label: 'Work', href: routes.projects },
      { label: 'About', href: routes.about },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: routes.blog },
      { label: 'FAQ', href: routes.faq },
    ],
  },
  {
    title: 'Get in touch',
    links: [
      { label: 'Contact', href: routes.contact },
      { label: 'Email me', href: `mailto:${site.email}` },
    ],
  },
]

/** Single-row footer links, used by the backup FooterSimple.tsx. */
export const footerNav: NavLink[] = headerNav

export const socials: SocialLink[] = [
  { kind: 'github', label: 'GitHub', href: 'https://github.com/dev-sahab' },
  { kind: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/sahab-mi' },
  { kind: 'email', label: 'Email', href: `mailto:${site.email}` },
]

export const legalNav: NavLink[] = [
  { label: 'Privacy Policy', href: routes.privacy },
  { label: 'Terms of Service', href: routes.terms },
  { label: 'Cookie Policy', href: routes.cookies },
]
