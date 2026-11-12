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
      'Most business websites cost between $500 and $3,000. A landing page starts at $200. A 5 to 10 page WordPress site usually runs $500 to $2,500, a Webflow site with a CMS $800 to $3,000, and a WooCommerce store $1,000 to $4,000. Next.js sites and custom apps start at $2,000, with the final price set after a call. Once I know what you need, you get a fixed quote in USD, so the price won’t change halfway through.',
  },
  {
    id: 'timeline',
    question: 'How long does it take?',
    answer:
      'Most landing pages go live in 2 to 3 days and most business websites in 1 to 2 weeks. An online store usually needs 2 to 4 weeks, and a custom Next.js site 3 to 6. You get a clear timeline together with the fixed quote, before anything starts.',
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
