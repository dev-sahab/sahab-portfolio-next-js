import type { HeadingText, Service } from './types'

export const servicesSection = {
  eyebrow: '02 — Services',
  title: 'Hire me like a\nstudio, *work with*\n*one developer.*' satisfies HeadingText,
  intro:
    'One point of contact for your whole website. I build it, and my trusted partners cover UI/UX design, SEO and marketing — no chasing five freelancers.',
}

// TODO: point each `href` at its service page once those exist — until then
// the whole card leads to the quote form.
export const services: Service[] = [
  {
    id: 'wordpress',
    variant: 'deep',
    href: '#contact',
    badge: 'Most requested',
    stack: ['wordpress', 'woocommerce', 'elementor', 'php'],
    title: 'WordPress and\nWooCommerce',
    description:
      'Custom WordPress development with Elementor, Crocoblock and WooCommerce: themes, plugins and online stores that are fast and easy to manage.',
    features: [
      'Custom themes and Elementor widgets',
      'WooCommerce stores and custom plugins',
      'Speed, security and on-page SEO',
    ],
    bestFor: 'Best for shops, service businesses, blogs',
  },
  {
    id: 'webflow',
    variant: 'plain',
    href: '#contact',
    stack: ['webflow', 'framer', 'figma'],
    title: 'Webflow\nand Framer',
    description:
      'Webflow and Framer development with a clean Client-First structure, CMS, interactions and integrations your team can run.',
    features: [
      'CMS collections and interactions',
      'Memberstack logins and gated content',
      'Make.com, Airtable and Stripe automation',
    ],
    bestFor: 'Best for startups and marketing teams',
  },
  {
    id: 'apps',
    variant: 'accent',
    href: '#contact',
    stack: ['react', 'nextjs', 'nodejs', 'mongodb'],
    title: 'Custom apps\nand automation',
    description:
      'Web apps and automations on React, Node.js and tools like n8n and Make.com, for when a site needs to do real work.',
    features: ['React and Next.js front ends', 'Node.js, Express and MongoDB APIs', 'AI agents and workflow automation'],
    bestFor: 'Best for dashboards and custom tools',
  },
]

export const projectIncludes = [
  { icon: 'tag', label: 'Fixed price before work starts' },
  { icon: 'link', label: 'Staging link to review' },
  { icon: 'pencil', label: 'Editable by your team' },
  { icon: 'shield', label: 'On call for fixes after launch' },
] as const
