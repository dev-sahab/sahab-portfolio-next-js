import type { FaqItem, HeadingText } from './types'

export const faqSection = {
  eyebrow: '05 — FAQ',
  title: 'Questions,\n*answered.*' satisfies HeadingText,
  intro: 'The things clients usually ask before the first message. Anything else, just email me.',
}

// NOTE: only the first answer exists in the Figma file. The other four are
// drafted from copy used elsewhere on the page — review before launch.
export const faqs: FaqItem[] = [
  {
    id: 'cost',
    question: 'How much does a website cost?',
    answer:
      'Every project gets a fixed price once I understand it, whether you bring a Figma file or just an idea. You’ll know the full cost and scope before any work starts.',
  },
  {
    id: 'timeline',
    question: 'How long does it take?',
    answer:
      'It depends on the scope. A landing page can go live within days, while a full site or store takes longer. You get a clear timeline together with the fixed quote, before anything starts.',
  },
  {
    id: 'editing',
    question: 'Can I edit the site myself after launch?',
    answer:
      'Yes. Sites are built in WordPress, Webflow or Framer so your team can update text, images and pages without touching code — and I stay on call for fixes after launch.',
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
