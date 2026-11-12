import { routes } from '@/lib/v8/routes'
import type { HeadingText, Project } from './types'

export const workSection = {
  eyebrow: '01 / Selected work',
  title: 'Recent client sites,\n*live and in use.*' satisfies HeadingText,
  intro: 'A few recent WordPress, WooCommerce and Webflow websites I built for clients. Hover a screen to scroll the whole page.',
  footerNote: '300+ projects delivered so far. See more WordPress, Webflow and web app work.',
  allProjects: { label: 'See all projects', href: routes.projects },
}

const CLOUDINARY = 'https://res.cloudinary.com/lzhmop14/image/upload/w_1400,q_auto,f_auto'

// `caseStudyHref` = the project's page; slugs match the CMS (dashboard) entries.
export const projects: Project[] = [
  {
    slug: 'hightailpet',
    title: 'Hightailpet',
    year: '2026',
    category: 'Service business',
    summary:
      'A site for a pet waste removal service in Greater Austin, Texas, selling recurring, one-time and deodorizing yard cleanups.',
    stack: ['wordpress', 'elementor'],
    domain: 'hightailpet.com',
    image: `${CLOUDINARY}/v1788022802/sahab-projects/hightail-3ups3s.jpg`,
    imageAlt: 'Hightailpet homepage',
    caseStudyHref: routes.project('hightailpet'),
    liveUrl: 'https://hightailpet.com/',
    featured: true,
  },
  {
    slug: 'glamlip',
    title: 'GLAMLIP',
    year: '2026',
    category: 'Online store',
    summary: 'mylipscare, an online store for lip care products on the Hera theme, customised in Elementor.',
    stack: ['wordpress', 'woocommerce'],
    domain: 'mylipscare.com',
    image: `${CLOUDINARY}/v1787933058/sahab-projects/glamlip-hc04mh.jpg`,
    imageAlt: 'GLAMLIP store homepage',
    caseStudyHref: routes.project('glamlip-mylipscare'),
    liveUrl: 'https://mylipscare.com/',
    menuIcon: 'woocommerce',
  },
  {
    slug: 'truntria',
    title: 'TruNtria',
    year: '2024',
    category: 'Landing page',
    summary: 'A supplement landing page, built in a single day from the client’s Figma design.',
    stack: ['wordpress', 'elementor'],
    domain: 'truntria landing page',
    image: `${CLOUDINARY}/v1788019309/sahab-projects/truntria-yst300.jpg`,
    imageAlt: 'TruNtria landing page',
    caseStudyHref: routes.project('truntria'),
    menuIcon: 'elementor',
  },
]
