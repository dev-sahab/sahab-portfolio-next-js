import { routes } from '@/lib/v8/routes'
import type { HeadingText, TimelineEntry } from './types'

export const aboutSection = {
  eyebrow: '03 / About',
  title: 'Changelog. *Five*\n*years of releases.*' satisfies HeadingText,
  portrait: { src: '/v8/portrait.jpg', alt: 'Sahab Uddin, freelance web developer' },
  bio: "I build websites for businesses that want results. After 300+ projects, my routine hasn't changed: clean code, fast pages, every screen tested. I build sites that earn their place: more enquiries and more sales, not just good looks.",
  storyLink: { label: 'Read my full story', href: routes.about },
}

export const timeline: TimelineEntry[] = [
  {
    period: '2025 – now',
    role: 'Professional CMS Developer',
    version: 'v5 current',
    current: true,
    org: 'PIXELVEGA · promoted from Jr. WordPress Developer',
    description:
      '120+ client projects, including 50+ Webflow builds: business sites, WooCommerce stores and CMS platforms with custom PHP, JavaScript and third-party integrations.',
  },
  {
    period: '2023 – 2025',
    role: 'WordPress Developer',
    version: 'v4',
    org: 'TechNuxt · remote',
    description:
      'Turned designs into responsive Elementor websites, customised WooCommerce stores, themes and plugins, and cut load times by roughly 30%.',
  },
  {
    period: '2021 – 2025',
    role: 'Web Developer',
    version: 'v3',
    org: 'Webeliyo',
    description:
      'Built WooCommerce stores, landing pages and custom Elementor + Crocoblock sites, with speed optimisation and on-page SEO.',
  },
  {
    period: '2021 – now',
    role: 'Freelance Web Developer',
    version: 'v2 · ongoing',
    org: 'Upwork & Fiverr',
    description:
      'WordPress, Webflow and custom builds for clients in many industries, with a 5.0 average across 200+ reviews.',
  },
  {
    period: '2018',
    role: 'Started coding',
    version: 'v1',
    org: 'Self-taught',
    description: 'Hand-coded a first page in HTML and CSS, and kept going.',
  },
]
