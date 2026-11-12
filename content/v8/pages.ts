import type { FaqItem, HeadingText } from './types'
import { faqs } from './faq'

/**
 * Copy for the inner v8 pages (about, services, contact, FAQ). Facts are
 * taken from the homepage content (timeline, reviews, services); anything
 * new is marked "review" so Sahab can check it before launch.
 */

// ── About ──
export const aboutPage = {
  title: 'Five years of *shipping*\n*websites that work.*' satisfies HeadingText,
  description:
    'Sahab Uddin is a freelance web developer for WordPress, Webflow and Next.js. 300+ projects since 2021, a 5.0 rating from 200+ reviews, and fixed quotes up front.',
  story: [
    'I wrote my first web page in 2018, in plain HTML and CSS, teaching myself from tutorials. In 2021 I took my first paid WordPress project on Upwork. Five years and 300+ projects later, clients from around the world still find me there, on Fiverr, and more and more through referrals.',
    'Freelancing is only half of where I learned the job. I’ve also worked inside agency teams, where I picked up the habits clients never see but always feel: tidy builds, real testing on real phones, and pages that load fast. That agency work is also where I built 50+ Webflow sites.',
    'Your project gets a fixed timeline when you get the quote, and I keep to it. You talk to me directly, not an account manager, and you hear back within 24 hours. For UI/UX design, SEO and marketing I bring in partners I trust, so you still deal with one person.',
  ],
  /** The strip under the About hero: a short line and a quiet note per item. */
  now: {
    focus: 'Sites that bring in work',
    focusNote: 'Business sites, online stores and web apps',
    availability: 'Taking new projects',
    availabilityNote: 'Replies within 24 hours',
    stack: 'WordPress, Webflow and Next.js',
    stackNote: 'Plus WooCommerce, Elementor and React',
    reach: 'Clients worldwide',
    reachNote: 'Fully remote, from first call to launch',
  },
  principles: [
    {
      title: 'Your requirements come first',
      text: 'Before I quote, I ask about your business, your customers and what the site has to do for them. A pretty site that brings in nothing is a failed project.',
    },
    {
      title: 'Then a fixed price, before any work',
      text: 'Once the scope is clear you get one number and a delivery date, whether you sent a Figma file or a two-line idea. No hourly meter running.',
    },
    {
      title: 'Fast, and easy for your team to edit',
      text: 'Clean code, compressed images and on-page SEO in every build, set up so your team can change text, images and pages without calling me.',
    },
    {
      title: 'Still here after launch',
      text: 'You review everything on a staging link before launch, and if something breaks after it goes live, I fix it.',
    },
  ],
}

// ── Services ──
export const servicesPage = {
  title: 'Web development services,\n*from one developer.*' satisfies HeadingText,
  description:
    'WordPress and WooCommerce development, Webflow and Framer sites, and custom web app development. Fixed quotes, a staging link to review, support after launch.',
  intro:
    'You work with me directly, from the first call to launch. I build the site or app myself, and trusted partners cover UI/UX design, SEO and marketing when you need them.',
  meta: [
    { label: 'First reply', value: 'Within 24 hours' },
    { label: 'Pricing', value: 'Fixed quote, up front' },
    { label: 'Partners', value: 'UI/UX, SEO, marketing' },
    { label: 'After launch', value: 'On call for fixes' },
  ],
  /** Extra detail per service card id (content/v8/services.ts). */
  details: {
    wordpress: {
      heading: 'WordPress and *WooCommerce development*',
      deliverables: [
        'Custom themes and plugin development',
        'WooCommerce stores, products and checkout flows',
        'Elementor and Crocoblock builds from your design',
        'Speed optimization and on-page SEO',
        'Migrations, fixes and ongoing maintenance',
      ],
      fit: 'You want a site or shop your team can run day to day, with room to grow through plugins.',
    },
    webflow: {
      heading: 'Webflow and *Framer development*',
      deliverables: [
        'Webflow and Framer builds with a clean Client-First structure',
        'CMS collections, interactions and animation',
        'Memberstack logins and gated content',
        'Make.com, n8n and Airtable automation',
        'Responsive builds, SEO setup and migrations',
      ],
      fit: 'You care about design detail and want your marketing team to publish pages without a developer.',
    },
    apps: {
      heading: 'Custom web app *development*',
      deliverables: [
        'Fast React and Next.js front ends',
        'The right back end for your logic: Node.js, Laravel and more',
        'Custom dashboard to run your system in one place',
        'Automation and AI agents for repetitive work',
        'Integrations with the tools you already use',
      ],
      fit: 'Your website needs to do real work: logins, data, dashboards or automated workflows.',
    },
  } as Record<string, { heading: string; deliverables: string[]; fit: string }>,
}

// ── Contact ──
export const contactPage = {
  description:
    'Hire a freelance web developer for your WordPress, Webflow or web app project. Share a Figma file, a brief or just the idea and get a fixed quote within 24 hours.',
  steps: [
    { title: 'Reply within 24 hours', text: 'Questions about your goals, plus a first look at the scope.' },
    { title: 'Plan and fixed quote', text: 'What gets built, on which platform, what it costs and when it launches.' },
    { title: 'Build and review', text: 'Progress on a staging link you can click through before anything goes live.' },
  ],
  timeZone: 'Asia/Dhaka',
}

// ── FAQ ──
const faq = (id: string) => faqs.find((f) => f.id === id)!

// review: answers below without a homepage original were drafted from the
// rest of the site's copy (services, process, "every project includes").
export const faqPage = {
  description:
    'Answers to common web development questions: what a website costs, how long it takes, WordPress vs Webflow, editing your site and support after launch.',
  groups: [
    {
      id: 'pricing',
      title: 'Pricing and scope',
      items: [
        faq('cost'),
        faq('design-first'),
        {
          id: 'existing-site',
          question: 'Can you work on my existing site?',
          answer:
            'Yes. Redesigns, fixes and SEO work on existing sites are a big part of what I do. Share the link and what isn’t working, and you’ll get a plan and a fixed quote.',
        },
      ],
    },
    {
      id: 'process',
      title: 'Process and timeline',
      items: [
        faq('timeline'),
        {
          id: 'start',
          question: 'What do you need from me to get started?',
          answer:
            'A Figma file, a rough brief or just the idea is enough. I’ll reply within 24 hours with questions, next steps and a fixed quote.',
        },
        {
          id: 'staging',
          question: 'Will I see the site before it goes live?',
          answer: 'Yes. You review everything on a staging link first, and nothing goes live until you’re happy with it.',
        },
        faq('partners'),
      ],
    },
    {
      id: 'platforms',
      title: 'Platforms',
      items: [
        {
          id: 'which-platform',
          question: 'Which platform should I choose?',
          answer:
            'It depends on who will run the site. WordPress suits content-heavy sites and online stores; Webflow and Framer suit design-led marketing sites; a custom build makes sense when you need logins, data or dashboards. The plan includes a recommendation and the reason for it.',
        },
        faq('editing'),
      ],
    },
    {
      id: 'after-launch',
      title: 'After launch',
      items: [
        {
          id: 'speed-seo',
          question: 'Will my site be fast and show up on Google?',
          answer:
            'Speed and on-page SEO are built in: clean code, optimized images and a proper page structure. For ongoing SEO and marketing, my partners can take over after launch.',
        },
        {
          id: 'support',
          question: 'Do you help after the site is live?',
          answer: 'Yes. I stay on call for fixes after launch, and can look after updates and maintenance if you’d like.',
        },
      ],
    },
  ] satisfies { id: string; title: string; items: FaqItem[] }[],
}
