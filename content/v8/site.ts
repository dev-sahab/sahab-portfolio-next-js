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

export const headerNav: NavLink[] = [
  { label: 'Work', href: `#${sectionIds.work}` },
  { label: 'Services', href: `#${sectionIds.services}` },
  { label: 'About', href: `#${sectionIds.about}` },
  { label: 'Reviews', href: `#${sectionIds.reviews}` },
  { label: 'FAQ', href: `#${sectionIds.faq}` },
]

export const footerNav: NavLink[] = [...headerNav, { label: 'Blog', href: '/blog' }]

export const socials: SocialLink[] = [
  { kind: 'github', label: 'GitHub', href: 'https://github.com/dev-sahab' },
  { kind: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/sahab-mi' },
  { kind: 'email', label: 'Email', href: `mailto:${site.email}` },
]

// TODO: these pages don't exist yet — point them at real routes before launch.
export const legalNav: NavLink[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Cookie Policy', href: '#' },
]
