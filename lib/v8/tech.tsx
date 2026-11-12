import type { ComponentType, SVGProps } from 'react'
import {
  SiAirtable,
  SiElementor,
  SiExpress,
  SiFigma,
  SiFramer,
  SiGsap,
  SiLaravel,
  SiMysql,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiWix,
  SiJavascript,
  SiMake,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiStripe,
  SiTailwindcss,
  SiWebflow,
  SiWordpress,
} from 'react-icons/si'
import type { TechKey } from '@/content/v8/types'

/**
 * Crocoblock's official "C" mark (not in Simple Icons) — path taken from the
 * logo on crocoblock.com, centred in a 24×24 box. Drop-in like a react-icons glyph.
 */
function CrocoblockIcon({ size, shape: _shape, width, height, ...rest }: SVGProps<SVGSVGElement> & { size?: number | string; shape?: 'circle' }) {
  return (
    <svg viewBox="-4.51 -0.4 24 24" width={width ?? size ?? 24} height={height ?? size ?? 24} fill="currentColor" {...rest}>
      <path d="M11.838 5.80391C13.4404 5.80391 14.7392 4.50492 14.7392 2.90274C14.7392 1.30056 13.4404 0.00156946 11.838 0.00156946C11.8354 0.00156946 11.8329 0.00194865 11.8302 0.00194865C5.42495 0.00612 0.233521 5.19983 0.233521 11.6063C0.233521 18.0153 5.42912 23.2108 11.838 23.2108C13.4404 23.2108 14.7392 21.9118 14.7392 20.3096C14.7392 18.7074 13.4404 17.4084 11.838 17.4084C11.8371 17.4084 11.8363 17.4086 11.8354 17.4086C8.63215 17.4071 6.03567 14.8099 6.03567 11.6063C6.03567 8.40172 8.63348 5.80391 11.838 5.80391Z" />
    </svg>
  )
}

/**
 * WooCommerce's current brand mark: the white "W" on a purple disc (the W is
 * lifted from woocommerce.com's logo). Self-coloured, so it ignores `color`.
 */
function WooIcon({ size, shape: _shape, width, height, fill: _fill, ...rest }: SVGProps<SVGSVGElement> & { size?: number | string; shape?: 'circle' }) {
  return (
    <svg viewBox="0 0 24 24" width={width ?? size ?? 24} height={height ?? size ?? 24} {...rest}>
      <circle cx="12" cy="12" r="12" fill="#873EFF" />
      <path transform="translate(12 12.15) scale(0.335) translate(-22.2 -13)" fill="#fff" d="M12.0825 25.2704C14.8471 25.2704 17.0657 23.9052 18.7381 20.7651L22.4584 13.8023V19.707C22.4584 23.1884 24.7111 25.2704 28.1925 25.2704C30.923 25.2704 32.9368 24.0758 34.8822 20.7651L43.4492 6.29339C45.3264 3.11918 43.9953 0.72998 39.8654 0.72998C37.6469 0.72998 36.2134 1.44674 34.9164 3.87006L29.0117 14.9628V5.09879C29.0117 2.1635 27.6123 0.72998 25.0183 0.72998C22.9704 0.72998 21.3321 1.6174 20.0692 4.07485L14.5058 14.9628V5.20119C14.5058 2.0611 13.2088 0.72998 10.0687 0.72998H3.65206C1.22873 0.72998 0 1.85632 0 3.93833C0 6.02034 1.29699 7.21494 3.65206 7.21494H6.28017V19.6729C6.28017 23.1884 8.63523 25.2704 12.0825 25.2704Z" />
    </svg>
  )
}

/** n8n's node-graph mark (Simple Icons, not yet in the installed react-icons). */
function N8nIcon({ size, shape: _shape, width, height, ...rest }: SVGProps<SVGSVGElement> & { size?: number | string; shape?: 'circle' }) {
  return (
    <svg viewBox="0 0 24 24" width={width ?? size ?? 24} height={height ?? size ?? 24} fill="currentColor" {...rest}>
      <path d="M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632" />
    </svg>
  )
}

/**
 * Memberstack's multi-colour "M" mark (from memberstack.com; not in Simple
 * Icons). Too detailed to inline per chip, so it's one cached file.
 */
function MemberstackIcon({ size, shape: _shape, width, height, fill: _fill, ...rest }: SVGProps<SVGSVGElement> & { size?: number | string; shape?: 'circle' }) {
  return (
    <svg viewBox="0 0 24 24" width={width ?? size ?? 24} height={height ?? size ?? 24} {...rest}>
      <image href="/v8/logos/memberstack.svg" x="0" y="2.9" width="24" height="18.25" />
    </svg>
  )
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; shape?: 'circle' }>

export interface TechMeta {
  label: string
  icon: IconComponent
  /**
   * Official brand colour. `null` = monochrome brand (Next.js, Express…) or a
   * product with no published logo glyph — rendered in `currentColor` so it
   * stays legible on both themes.
   */
  color: string | null
  /**
   * True when the icon paints its own coloured background (none do today).
   * Transparent glyphs get a white disc in round badges; these keep their own.
   */
  hasBackground?: boolean
}

/**
 * Single source of truth for every technology logo on the v8 page (tool
 * marquee, project chips, service stacks, hero pipeline, ⌘K menu).
 *
 * Every entry is the brand's real logo: Simple Icons glyphs via react-icons,
 * plus inline/official marks for those react-icons lacks (Crocoblock, n8n,
 * Memberstack) or whose full logo is too wide for a chip (WooCommerce → Woo).
 */
export const TECH: Record<TechKey, TechMeta> = {
  wordpress: { label: 'WordPress', icon: SiWordpress, color: '#21759B' },
  elementor: { label: 'Elementor', icon: SiElementor, color: '#92003B' },
  woocommerce: { label: 'WooCommerce', icon: WooIcon, color: null },
  crocoblock: { label: 'Crocoblock', icon: CrocoblockIcon, color: '#33D7A1' },
  webflow: { label: 'Webflow', icon: SiWebflow, color: '#146EF5' },
  framer: { label: 'Framer', icon: SiFramer, color: '#0055FF' },
  wix: { label: 'Wix Studio', icon: SiWix, color: null },
  php: { label: 'PHP', icon: SiPhp, color: '#777BB4' },
  laravel: { label: 'Laravel', icon: SiLaravel, color: '#FF2D20' },
  tailwind: { label: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
  gsap: { label: 'GSAP', icon: SiGsap, color: '#0AE448' },
  react: { label: 'React', icon: SiReact, color: '#087EA4' },
  nextjs: { label: 'Next.js', icon: SiNextdotjs, color: null },
  nodejs: { label: 'Node.js', icon: SiNodedotjs, color: '#5FA04E' },
  mongodb: { label: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  mysql: { label: 'MySQL', icon: SiMysql, color: '#4479A1' },
  postgresql: { label: 'PostgreSQL', icon: SiPostgresql, color: '#4169E1' },
  prisma: { label: 'Prisma', icon: SiPrisma, color: null },
  figma: { label: 'Figma', icon: SiFigma, color: '#F24E1E' },
  make: { label: 'Make.com', icon: SiMake, color: '#6D00CC' },
  n8n: { label: 'n8n', icon: N8nIcon, color: '#EA4B71' },
  stripe: { label: 'Stripe', icon: SiStripe, color: '#635BFF' },
  memberstack: { label: 'Memberstack', icon: MemberstackIcon, color: null },
  airtable: { label: 'Airtable', icon: SiAirtable, color: '#18BFFF' },
  javascript: { label: 'JavaScript', icon: SiJavascript, color: '#E8C900' },
  express: { label: 'Express', icon: SiExpress, color: null },
}

// ── Free-text stack names (CMS) → registry keys ──
const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const ALIASES: Record<string, TechKey> = {
  woo: 'woocommerce',
  next: 'nextjs',
  node: 'nodejs',
  tailwindcss: 'tailwind',
  postgres: 'postgresql',
  makecom: 'make',
  js: 'javascript',
  expressjs: 'express',
  reactjs: 'react',
  wixstudio: 'wix',
}
const LOOKUP = new Map<string, TechKey>([
  ...(Object.keys(TECH) as TechKey[]).flatMap((key) => [
    [norm(key), key] as const,
    [norm(TECH[key].label), key] as const,
  ]),
  ...Object.entries(ALIASES),
])

/**
 * Maps the free-text `stack` strings typed in the dashboard ("WordPress",
 * "Woocommerce"…) onto logo keys. Names without a logo come back in `extra`
 * so they can still be shown as plain tags.
 */
export function toTechKeys(names: string[]): { keys: TechKey[]; extra: string[] } {
  const keys: TechKey[] = []
  const extra: string[] = []
  for (const name of names) {
    const key = LOOKUP.get(norm(name))
    if (key) {
      if (!keys.includes(key)) keys.push(key)
    } else if (name.trim()) extra.push(name.trim())
  }
  return { keys, extra }
}

