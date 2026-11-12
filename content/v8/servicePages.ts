import type { FaqItem, HeadingText, TechKey } from './types'

/**
 * One landing page per service (/services/<slug>), each aimed at one search
 * phrase so Google knows which page answers which query. The /services hub
 * links here. Facts come from the rest of the site (300+ projects, 50+
 * Webflow builds, 5.0 from 200+ reviews). Prices are Sahab's starting
 * ranges in USD (docs/MEMORY.md, 2026-11-13); every project still gets a fixed quote.
 */
export interface ServicePage {
  slug: string
  /** Matching card on the hub page (content/v8/services.ts). */
  serviceId: 'wordpress' | 'webflow' | 'apps' | 'agencies'
  /** Search phrase this page targets (also the breadcrumb label). */
  keyword: string
  metaTitle: string
  metaDescription: string
  eyebrow: string
  title: HeadingText
  intro: string
  meta: { label: string; value: string }[]
  stack: TechKey[]
  deliverablesHeading: HeadingText
  deliverables: { title: string; text: string }[]
  fit: string[]
  /** Projects whose stack includes any of these keys are shown as proof. */
  projectStacks: TechKey[]
  faqs: FaqItem[]
  /** Starting prices shown in the Pricing section. */
  pricing?: PriceRow[]
  /** Lowest project price on the page, for the Service schema's Offer (USD). */
  startingPrice?: number
}

export interface PriceRow {
  label: string
  price: string
  timeline: string
}

// One source for every price on the site (keep content/v8/faq.ts in step).
const PRICES = {
  landing: { label: 'Landing page, 1 to 3 pages', price: 'From $200', timeline: '2 to 3 days' },
  wordpressSite: { label: 'Business website, 5 to 10 pages, WordPress and Elementor', price: '$500 to $2,500', timeline: '1 to 2 weeks' },
  webflowSite: { label: 'Business website, 5 to 10 pages, Webflow with CMS', price: '$800 to $3,000', timeline: '1 to 3 weeks' },
  woocommerce: { label: 'WooCommerce store', price: '$1,000 to $4,000', timeline: '2 to 4 weeks' },
  wordpressToWebflow: { label: 'WordPress to Webflow migration', price: 'From $1,000', timeline: '1 to 2 weeks' },
  nextjs: { label: 'Next.js site or WordPress to Next.js migration', price: 'From $2,000', timeline: '3 to 6 weeks, final price after a call' },
  webApp: { label: 'Custom web app or custom features', price: 'Custom quote', timeline: 'Priced after a call' },
  maintenance: { label: 'Maintenance plan', price: '$100 to $300 per month', timeline: 'Ongoing' },
  hourly: { label: 'Hourly and white label work', price: '$40 per hour', timeline: 'As needed' },
} satisfies Record<string, PriceRow>

const shared = {
  meta: [
    { label: 'First reply', value: 'Within 24 hours' },
    { label: 'Pricing', value: 'Fixed quote, up front' },
    { label: 'Rating', value: '5.0 across 200+ reviews' },
    { label: 'Delivered', value: '300+ projects' },
  ],
}

export const servicePages: ServicePage[] = [
  {
    slug: 'wordpress-developer',
    serviceId: 'wordpress',
    keyword: 'WordPress developer',
    metaTitle: 'Hire a WordPress & Elementor Developer',
    metaDescription:
      'Freelance WordPress developer for Elementor, WooCommerce and Crocoblock sites. 300+ projects, fixed quotes and a staging link before launch.',
    eyebrow: 'WordPress developer for hire',
    title: 'WordPress developer\n*for sites your team runs.*',
    intro:
      'I’m a freelance WordPress developer. I build custom WordPress and WooCommerce websites with Elementor and Crocoblock, from your Figma file or just the idea, and hand them over set up so your team can edit every page without touching code.',
    meta: shared.meta,
    stack: ['wordpress', 'woocommerce', 'elementor', 'php'],
    deliverablesHeading: 'What I build\n*with WordPress.*',
    deliverables: [
      { title: 'Elementor builds from your design', text: 'Pages built to match your Figma file, with global styles and reusable templates so new pages stay on brand.' },
      { title: 'WooCommerce stores', text: 'Product catalogs, variations, checkout flows, payment gateways and the emails customers actually receive.' },
      { title: 'Crocoblock and JetEngine', text: 'Directories, listings, custom post types and dynamic filters without a pile of extra plugins.' },
      { title: 'Custom themes and plugins', text: 'PHP development when a page builder is not the right tool, written to WordPress coding standards.' },
      { title: 'Speed and on-page SEO', text: 'Image and script optimization, caching, clean headings, meta tags and schema on every build.' },
      { title: 'Fixes, migrations and maintenance', text: 'Moving hosts, rescuing a broken site, updating plugins safely, and staying on call after launch.' },
    ],
    fit: [
      'You want a site or online store your team runs day to day',
      'You need plugins and integrations to grow into',
      'You have an existing WordPress site that is slow, broken or hard to edit',
    ],
    projectStacks: ['wordpress', 'woocommerce', 'elementor'],
    pricing: [PRICES.landing, PRICES.wordpressSite, PRICES.woocommerce, PRICES.maintenance],
    startingPrice: 200,
    faqs: [
      { id: 'wp-cost', question: 'How much does it cost to hire a WordPress developer?', answer: 'It depends on the size of the site. A landing page starts at $200 and is usually live in 2 to 3 days. Most 5 to 10 page business sites built with Elementor cost $500 to $2,500 and take 1 to 2 weeks, and a WooCommerce store is $1,000 to $4,000. If you want me to look after the site afterwards, maintenance is $100 to $300 a month.' },
      { id: 'wp-elementor', question: 'Do you build with Elementor or custom code?', answer: 'Both. Most business sites are built with Elementor Pro so your team can edit them visually. When a feature needs it, I write a custom plugin or theme in PHP instead.' },
      { id: 'wp-existing', question: 'Can you fix or speed up my existing WordPress site?', answer: 'Yes. I start with a short audit of plugins, hosting and page weight, then send a fixed quote for the fixes. Most speed work is done without a redesign.' },
      { id: 'wp-woo', question: 'Can you build a WooCommerce store with my payment provider?', answer: 'Yes. WooCommerce works with Stripe, PayPal and most regional gateways. I set up products, shipping, taxes and the order emails, and test checkout before launch.' },
      { id: 'wp-handover', question: 'Will I be able to edit the site myself?', answer: 'Yes. Every build is handed over with editable templates and a short walkthrough, so you can change text, images and pages without a developer.' },
    ],
  },
  {
    slug: 'webflow-developer',
    serviceId: 'webflow',
    keyword: 'Webflow developer',
    metaTitle: 'Freelance Webflow Developer: Figma to Webflow',
    metaDescription:
      'Freelance Webflow developer: Figma to Webflow builds, CMS collections, interactions and Memberstack. 50+ Webflow sites shipped, fixed quote in 24 hours.',
    eyebrow: 'Freelance Webflow developer',
    title: 'Freelance Webflow developer,\n*Figma to live site.*',
    intro:
      'I’m a freelance Webflow developer with 50+ Webflow builds shipped. I turn Figma designs into responsive Webflow sites with a clean Client-First class structure, a CMS your marketing team can update, and interactions that match the design.',
    meta: shared.meta,
    stack: ['webflow', 'framer', 'make', 'n8n'],
    deliverablesHeading: 'What I build\n*with Webflow.*',
    deliverables: [
      { title: 'Figma to Webflow', text: 'Responsive builds that match the design at every breakpoint, using Client-First naming so the next developer can follow it.' },
      { title: 'CMS collections', text: 'Blog, case studies, team and job listings set up as CMS collections your team edits in the Webflow Editor.' },
      { title: 'Interactions and animation', text: 'Scroll, hover and page-load interactions built in Webflow, kept light so pages still load fast.' },
      { title: 'Memberstack and gated content', text: 'Logins, member areas and paid content with Memberstack, connected to your forms and email tools.' },
      { title: 'Automation', text: 'Forms and CMS connected to Airtable, HubSpot or Slack through Make.com and n8n.' },
      { title: 'Framer sites', text: 'Fast Framer builds for landing pages and launches when Framer suits the project better.' },
    ],
    fit: [
      'Your marketing team wants to publish without a developer',
      'You have a Figma design and need it built accurately',
      'You want hosting, security and updates handled by the platform',
    ],
    projectStacks: ['webflow', 'framer'],
    pricing: [PRICES.landing, PRICES.webflowSite, PRICES.wordpressToWebflow, PRICES.maintenance],
    startingPrice: 200,
    faqs: [
      { id: 'wf-cost', question: 'How much does it cost to hire a Webflow developer?', answer: 'A Webflow landing page starts at $200 and takes 2 to 3 days. A full 5 to 10 page site with CMS collections is usually $800 to $3,000 and takes 1 to 3 weeks. Moving an existing WordPress site to Webflow starts at $1,000. You’ll have a fixed number before I start, not an estimate that keeps growing.' },
      { id: 'wf-figma', question: 'Can you build my Figma design in Webflow exactly?', answer: 'Yes. I build every breakpoint from your Figma file and check it against the design on a staging link before launch. If something in the design will not work responsively, I flag it before building.' },
      { id: 'wf-migrate', question: 'Can you move my site from WordPress to Webflow?', answer: 'Yes. I rebuild the pages, import posts into the CMS and set up 301 redirects from every old URL, so you keep your search rankings.' },
      { id: 'wf-cms', question: 'Will my team be able to update the site?', answer: 'Yes. Content lives in CMS collections and the Webflow Editor, so your team can add posts, case studies and pages without touching the design.' },
      { id: 'wf-vs-wp', question: 'Should I choose Webflow or WordPress?', answer: 'Webflow suits marketing sites where design and easy editing matter most. WordPress suits online stores and sites that need many plugins. I build both and will recommend one after hearing your goals.' },
    ],
  },
  {
    slug: 'nextjs-developer',
    serviceId: 'apps',
    keyword: 'Next.js developer',
    metaTitle: 'Next.js Developer for Hire: Sites & Web Apps',
    metaDescription:
      'Next.js developer for custom web apps, dashboards and WordPress to Next.js migrations. Faster pages, no lost rankings, fixed price up front.',
    eyebrow: 'Next.js developer for hire',
    title: 'Next.js developer\n*for custom web apps.*',
    intro:
      'I build custom websites, dashboards and web apps with Next.js and React, and move slow WordPress sites to a headless Next.js front end without losing search rankings. This site is one of them: it runs on Next.js with its own dashboard.',
    meta: shared.meta,
    stack: ['nextjs', 'nodejs', 'laravel', 'mongodb'],
    deliverablesHeading: 'What I build\n*with Next.js.*',
    deliverables: [
      { title: 'Marketing sites on Next.js', text: 'Static and server-rendered pages that load fast, with metadata, sitemaps and schema built in.' },
      { title: 'WordPress to Next.js migration', text: 'Keep WordPress as the editor and serve a fast Next.js front end, or move the content out entirely. Every old URL gets a redirect.' },
      { title: 'Dashboards and admin panels', text: 'A private dashboard to manage your content, orders, leads or data in one place, with login and roles.' },
      { title: 'APIs and back ends', text: 'Node.js or Laravel back ends with MongoDB or SQL, built around how your business actually works.' },
      { title: 'Automation and AI agents', text: 'Repetitive work handed to scripts, n8n flows or AI agents connected to your tools.' },
      { title: 'Ongoing development', text: 'New features, fixes and performance work after launch, with a staging link for every change.' },
    ],
    fit: [
      'Your WordPress site is slow and plugins keep breaking',
      'You need a custom tool or dashboard, not a template',
      'You want a fast site you fully own, deployed on Vercel or your own server',
    ],
    projectStacks: ['nextjs', 'react', 'nodejs', 'laravel'],
    pricing: [PRICES.nextjs, PRICES.webApp, PRICES.maintenance],
    startingPrice: 2000,
    faqs: [
      { id: 'nx-cost', question: 'How much does it cost to hire a Next.js developer?', answer: 'A Next.js website, or moving a WordPress site to Next.js, starts at $2,000 and usually takes 3 to 6 weeks. The final price depends on the custom features and integrations it needs, so we talk it through on a call first, and then you get a fixed quote.' },
      { id: 'nx-migrate', question: 'Will I lose my Google rankings if I move from WordPress to Next.js?', answer: 'Not if the move is planned. I keep the same URLs where possible, add 301 redirects for the rest, carry over titles, descriptions and schema, and resubmit the sitemap in Search Console.' },
      { id: 'nx-headless', question: 'Can I keep editing in WordPress?', answer: 'Yes. With a headless setup WordPress stays your editor and Next.js only serves the pages. Your team keeps the editor it knows.' },
      { id: 'nx-hosting', question: 'Where will the site be hosted?', answer: 'Usually Vercel, which handles scaling and SSL. I can also deploy to your own server or cloud account.' },
      { id: 'nx-when', question: 'When is Next.js better than WordPress or Webflow?', answer: 'When you need custom features, a private dashboard, or maximum speed. For a standard business site, WordPress or Webflow is usually faster to build and cheaper to run.' },
    ],
  },
  {
    slug: 'white-label-for-agencies',
    serviceId: 'agencies',
    keyword: 'White label web development',
    metaTitle: 'White Label WordPress Developer for Agencies',
    metaDescription:
      'Outsource WordPress, Elementor and Webflow builds to one reliable developer. Your brand, your client, fixed quotes and on-time delivery.',
    eyebrow: 'White label web development for agencies',
    title: 'White label developer\n*for agencies.*',
    intro:
      'Agencies send me the design and the deadline; I build the WordPress or Webflow site under your brand. You keep the client relationship. I stay behind the scenes, reply within 24 hours and deliver on a staging link you can show your client.',
    meta: shared.meta,
    stack: ['wordpress', 'elementor', 'webflow', 'figma'],
    deliverablesHeading: 'What agencies\n*hand me.*',
    deliverables: [
      { title: 'Figma to WordPress or Webflow', text: 'Your designer’s file built accurately in Elementor or Webflow, ready for your client review.' },
      { title: 'Overflow projects', text: 'Extra capacity when your team is fully booked, without hiring.' },
      { title: 'WooCommerce builds', text: 'Online stores for your clients, set up and tested end to end.' },
      { title: 'Speed and fixes', text: 'Performance, bug fixes and plugin updates on sites you already manage.' },
      { title: 'Care plans', text: 'Ongoing maintenance for your client sites, billed to you, not them.' },
      { title: 'NDA and your brand', text: 'No credit on the site, no contact with your client unless you want it.' },
    ],
    fit: [
      'You sell websites but don’t want to hire a full-time developer',
      'Your designers work in Figma and need it built well',
      'You need one dependable developer instead of a rotating marketplace',
    ],
    projectStacks: ['wordpress', 'elementor', 'webflow'],
    pricing: [PRICES.hourly, PRICES.landing, PRICES.wordpressSite],
    startingPrice: 40,
    faqs: [
      { id: 'wl-nda', question: 'Will you sign an NDA and stay invisible to my client?', answer: 'Yes. I work under your brand, sign an NDA if you need one, and only talk to your client if you ask me to.' },
      { id: 'wl-pricing', question: 'How much does it cost to hire a white label web developer?', answer: 'My rate for agency and white label work is $40 an hour. If you’d rather have a fixed price, a landing page starts at $200 and a 5 to 10 page WordPress site is $500 to $2,500. Either way you know the cost up front, so you can set your own margin.' },
      { id: 'wl-time', question: 'What time zone do you work in?', answer: 'GMT+6. That overlaps with UK and European mornings and US evenings, so work often moves forward overnight for you.' },
      { id: 'wl-tools', question: 'Can you work in our tools?', answer: 'Yes. I can work in your Slack, ClickUp, Asana or Jira, and in your hosting and Webflow accounts.' },
    ],
  },
]

export const getServicePage = (slug: string) => servicePages.find((p) => p.slug === slug)
