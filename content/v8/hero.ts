import type { HeadingText, TechKey } from './types'

export const hero = {
  /** The page's h1 (styled small, above the slogan): the search phrase the homepage targets. */
  eyebrow: 'Freelance web developer for WordPress, Webflow & web apps',
  title: 'Websites,\n*engineered*\nto convert.' satisfies HeadingText,
  /** `**bold**` segments render in the primary text colour. */
  lede:
    'I’m Sahab Uddin. For 5+ years I’ve built **fast, SEO-friendly websites** and web apps for businesses around the world. One developer from the first idea to launch, and **still here after**.',
  capabilities: [
    { icon: 'pen', label: 'UI/UX design' },
    { icon: 'code', label: 'Development' },
    { icon: 'search', label: 'SEO' },
    { icon: 'trend', label: 'Marketing' },
    { icon: 'wrench', label: 'Maintenance' },
  ] as const,
  primaryCta: { label: 'Get a free quote', href: '#contact' },
  secondaryCta: { label: 'See the work', href: '#work' },
  trust: {
    rating: '5.0',
    ratingLabel: 'across 200+ reviews',
    facts: [
      { strong: '300+ projects', rest: 'delivered' },
      { strong: '5+ years', rest: 'of experience' },
    ],
  },
  keyboardHint: 'to search projects, services and pages',
}

/** Decorative cards floating around the hero headline (desktop only). */
export const heroFloats = {
  review: {
    rating: '5.0',
    quote: '“I continue to work with Shahab because of his dedication to quality.”',
    author: 'Pablo · Owner, Pakkabags',
  },
  snippet: {
    file: 'service-card.php',
    lines: [
      [{ text: 'class', tone: 'keyword' }, { text: ' ' }, { text: 'Service_Card', tone: 'var' }],
      [{ text: '  ' }, { text: 'extends', tone: 'keyword' }, { text: ' ' }, { text: 'Widget_Base', tone: 'var' }, { text: ' {' }],
      [{ text: '  ' }, { text: '// 24px gap, H3 at 28px', tone: 'comment' }],
      [{ text: '  ' }, { text: 'render', tone: 'function' }, { text: '() { … }' }],
      [{ text: '}' }],
    ],
  },
  pipeline: [
    { tech: 'figma' as TechKey, label: 'Figma' },
    { tech: null, label: 'Code' },
    { tech: null, label: 'Live', live: true },
  ],
  performance: { score: 90, label: '90+', title: 'Performance budget', note: 'checked on every build' },
} as const
