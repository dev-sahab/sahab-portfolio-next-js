import { routes } from '@/lib/v8/routes'
import type { HeadingText, TimelineEntry } from './types'

export const aboutSection = {
  eyebrow: '03 / About',
  title: 'Changelog. *Five*\n*years of releases.*' satisfies HeadingText,
  portrait: { src: '/v8/portrait.jpg', alt: 'Sahab Uddin, freelance web developer' },
  bio: "I build websites for small businesses, startups and agencies that need their site to bring in work, not just look nice. 300+ projects in, the routine hasn't changed: clean code, fast pages, every screen tested before launch, and a site your team can edit on its own.",
  storyLink: { label: 'Read my full story', href: routes.about },
}

export const timeline: TimelineEntry[] = [
  {
    period: '2025 – now',
    role: 'Professional CMS Developer',
    version: 'v5 · current',
    current: true,
    org: 'PIXELVEGA · promoted from Jr. WordPress Developer',
    description:
      '120+ client projects and 50+ Webflow builds so far. Business sites, WooCommerce stores and CMS platforms, wired up with custom PHP, JavaScript and third-party tools.',
  },
  {
    period: '2023 – 2025',
    role: 'WordPress Developer',
    version: 'v4',
    org: 'TechNuxt · remote',
    description:
      'Turned designs into fast, responsive Elementor sites and tailored WooCommerce stores, themes and plugins. Cut load times by about 30% along the way.',
  },
  {
    period: '2021 – 2023',
    role: 'Web Developer',
    version: 'v3',
    org: 'Webeliyo',
    description:
      'Launched WooCommerce stores, landing pages and custom Elementor + Crocoblock sites, each one tuned for speed and on-page SEO.',
  },
  {
    period: '2021 – now',
    role: 'Freelance Web Developer',
    version: 'v2 · ongoing',
    current: true,
    org: 'Upwork & Fiverr',
    description:
      'WordPress, Webflow and custom-coded sites for small businesses, startups and agencies worldwide. A 5.0 rating across 200+ client reviews.',
  },
  {
    period: '2018',
    role: 'Started coding',
    version: 'v1',
    org: 'Self-taught',
    description: 'Wrote my first page in plain HTML and CSS, self-taught, and never stopped building.',
  },
]
