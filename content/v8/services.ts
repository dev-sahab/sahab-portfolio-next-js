import { routes } from '@/lib/v8/routes'
import type { HeadingText, Service } from './types'

export const servicesSection = {
  eyebrow: '02 — Services',
  title: 'Hire me like a\nstudio, *work with*\n*one developer.*' satisfies HeadingText,
  intro:
    'One point of contact for your whole website. I build it, and my trusted partners cover UI/UX design, SEO and marketing — no chasing five freelancers.',
  /** Text link under the intro → the full services page. */
  cta: { label: 'View all services', href: routes.services },
}

// Each card links to its detailed section on the services page.
export const services: Service[] = [
  {
    id: 'wordpress',
    variant: 'deep',
    href: routes.service('wordpress'),
    badge: 'Most requested',
    stack: ['wordpress', 'woocommerce', 'elementor', 'php'],
    title: 'WordPress and\nWooCommerce',
    description:
      'Custom WordPress development with Elementor, Crocoblock and WooCommerce: themes, plugins and online stores that are fast and easy to manage.',
    features: [
      'Custom themes and plugin development',
      'WooCommerce stores and checkout flows',
      'Elementor and Crocoblock builds',
      'Speed, security and on-page SEO',
    ],
    bestFor: 'Best for shops, service businesses, blogs',
  },
  {
    id: 'webflow',
    variant: 'plain',
    href: routes.service('webflow'),
    stack: ['webflow', 'framer', 'make', 'n8n'],
    title: 'Webflow\nand Framer',
    description:
      'Webflow and Framer development with a clean Client-First structure, CMS, interactions and integrations your team can run.',
    features: [
      'CMS collections and interactions',
      'Memberstack logins and gated content',
      'Make.com, n8n and Airtable automation',
      'Responsive builds, SEO setup and migrations',
    ],
    bestFor: 'Best for startups and marketing teams',
  },
  {
    id: 'apps',
    variant: 'accent',
    href: routes.service('apps'),
    stack: ['nextjs', 'nodejs', 'laravel', 'mongodb'],
    title: 'Custom apps\nand automation',
    description:
      'Custom web apps, dashboards and automation built around how your business works, on whichever platform or stack suits the job.',
    features: [
      'Fast React and Next.js front ends',
      'The right back end for your logic: Node.js, Laravel and more',
      'Custom dashboard to run your system in one place',
      'Automation and AI agents for repetitive work',
    ],
    bestFor: 'Best for dashboards and custom tools',
  },
]

export const projectIncludes = [
  { icon: 'tag', label: 'Fixed price before work starts' },
  { icon: 'link', label: 'Staging link to review' },
  { icon: 'pencil', label: 'Editable by your team' },
  { icon: 'shield', label: 'On call for fixes after launch' },
] as const
