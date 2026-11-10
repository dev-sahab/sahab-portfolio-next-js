import type { HeadingText } from './types'

export const contactSection = {
  eyebrow: '06 — Contact',
  title: 'Bring the idea. *Get*\n*a plan* in 24 hours.' satisfies HeadingText,
  intro:
    'Share a Figma file, a rough brief or just the idea. You’ll get a reply within 24 hours with next steps and a fixed quote.',
  emailLabel: 'Prefer email?',
}

export const quoteForm = {
  projectTypes: ['New website', 'Redesign', 'Online store', 'Web app', 'SEO & maintenance'],
  // TODO: confirm these ranges — the Figma file only shows the placeholder.
  budgets: ['Under $500', '$500 – $1,500', '$1,500 – $5,000', '$5,000+', 'Not sure yet'],
  timelines: ['As soon as possible', 'Within a month', 'In 1–3 months', 'Just exploring'],
  placeholders: {
    name: 'Jane Cooper',
    email: 'jane@company.com',
    budget: 'Select a range',
    timeline: 'When do you want to launch?',
    message: 'A few lines about your business and what you want the site to do…',
  },
  note: 'No commitment. You get a plan and a fixed quote first.',
  submit: 'Send — get a plan in 24 hours',
}
