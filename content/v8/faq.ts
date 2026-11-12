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
      'Most business websites cost between $1,500 and $5,000. A landing page starts at $600. A 5 to 10 page WordPress site usually runs $1,500 to $4,000, a Webflow site with a CMS $2,000 to $5,000, and a WooCommerce store $3,000 to $8,000. Custom web apps start at $8,000. Once I know what you need, you get a fixed quote in USD, so the price won’t change halfway through.',
  },
  {
    id: 'timeline',
    question: 'How long does it take?',
    answer:
      'Most landing pages take 1 to 2 weeks and most business websites 2 to 5. An online store usually needs 5 to 10 weeks, and the first version of a custom web app 10 to 16. You get a clear timeline together with the fixed quote, before anything starts.',
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
