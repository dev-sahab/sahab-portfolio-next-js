import { routes } from '@/lib/v8/routes'
import type { HeadingText, Service } from './types'

export const servicesSection = {
  eyebrow: '02 / Services',
  title: 'Web development services,\n*from one developer.*' satisfies HeadingText,
  intro:
    'WordPress, Webflow and custom web app development with one point of contact. I build it, and trusted partners handle UI/UX design, SEO and marketing, so you’re not managing five freelancers.',
  /** Text link under the intro → the full services page. */
  cta: { label: 'View all services', href: routes.services },
}

// Each card links to that service's own landing page (/services/<slug>).
export const services: Service[] = [
  {
    id: 'wordpress',
    variant: 'deep',
    href: routes.servicePage('wordpress-developer'),
    badge: 'Most requested',
    stack: ['wordpress', 'woocommerce', 'elementor', 'php'],
    title: 'WordPress and\nWooCommerce',
    description:
      'Custom WordPress development with Elementor, Crocoblock and WooCommerce. Themes, plugins and online stores that load fast and are easy to run.',
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
    href: routes.servicePage('webflow-developer'),
    stack: ['webflow', 'framer', 'make', 'n8n'],
    title: 'Webflow\nand Framer',
    description:
      'Webflow and Framer websites with a clean Client-First structure, a CMS your team can update, smooth interactions and the integrations you need.',
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
    href: routes.servicePage('nextjs-developer'),
    stack: ['nextjs', 'nodejs', 'laravel', 'mongodb'],
    title: 'Custom apps\nand automation',
    description:
      'Custom web apps, dashboards and automation built around how your business actually works, on the stack that fits the job.',
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
