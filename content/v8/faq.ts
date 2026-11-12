import type { FaqItem, HeadingText } from './types'

export const faqSection = {
  eyebrow: '05 / FAQ',
  title: 'Questions about hiring\n*a web developer.*' satisfies HeadingText,
  intro: 'What clients usually ask before hiring a web developer. If your question isn’t here, just email me.',
}

// Answers are drafted from copy used elsewhere on the site; review if anything changes.
export const faqs: FaqItem[] = [
  {
    id: 'cost',
    question: 'How much does a website cost?',
    answer:
      'Most business websites cost $1,500 to $5,000. A landing page starts at $600, a 5 to 10 page WordPress site is $1,500 to $4,000, a Webflow site with CMS is $2,000 to $5,000, and a WooCommerce store is $3,000 to $8,000. Custom web apps start at $8,000. You get a fixed quote in USD before any work starts.',
  },
  {
    id: 'timeline',
    question: 'How long does it take?',
    answer:
      'A landing page takes 1 to 2 weeks, a business website 2 to 5 weeks, an online store 5 to 10 weeks, and a custom web app 10 to 16 weeks for the first version. You get a clear timeline together with the fixed quote, before anything starts.',
  },
  {
    id: 'editing',
    question: 'Can I edit the site myself after launch?',
    answer:
      'Yes. Sites are built in WordPress, Webflow or Framer, so your team can update text, images and pages without touching code. I also stay on call for fixes after launch.',
  },
  {
    id: 'partners',
    question: 'Can you handle design, SEO and marketing too?',
    answer:
      'Yes. I build the site, and my trusted partners cover UI/UX design, SEO and marketing, so you keep one point of contact instead of chasing five freelancers.',
  },
  {
    id: 'design-first',
    question: 'Do I need a design before we start?',
    answer:
      'No. Share a Figma file if you have one, or just a rough brief or the idea. When there’s no design yet, my design partner handles the UI/UX before I start building.',
  },
]
