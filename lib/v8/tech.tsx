import type { ComponentType, SVGProps } from 'react'
import {
  SiAirtable,
  SiElementor,
  SiExpress,
  SiFigma,
  SiFramer,
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
import { monogram } from './monogram'

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
   * True when the icon paints its own coloured background (the monograms).
   * Transparent glyphs get a white disc in round badges; these keep their own.
   */
  hasBackground?: boolean
}

/**
 * Single source of truth for every technology logo on the v8 page (tool
 * marquee, project chips, service stacks, hero pipeline, ⌘K menu).
 *
 * Square brand glyphs come from Simple Icons. Products whose official logo
 * is a wide wordmark (WooCommerce, Wix, GSAP, PHP, n8n) — unreadable at
 * 14–26px — or that have no published glyph (Crocoblock, Memberstack) use a
 * compact brand-coloured monogram instead (see `monogram.tsx`).
 */
export const TECH: Record<TechKey, TechMeta> = {
  wordpress: { label: 'WordPress', icon: SiWordpress, color: '#21759B' },
  elementor: { label: 'Elementor', icon: SiElementor, color: '#92003B' },
  woocommerce: {
    label: 'WooCommerce',
    icon: monogram({ bg: '#7F54B3', fg: '#fff', short: 'W', long: 'Woo', shape: 'bubble' }),
    color: null, hasBackground: true,
  },
  crocoblock: {
    label: 'Crocoblock',
    icon: monogram({ bg: '#26262B', fg: '#fff', short: 'Cb', long: 'Cb', outline: true }),
    color: null, hasBackground: true,
  },
  webflow: { label: 'Webflow', icon: SiWebflow, color: '#146EF5' },
  framer: { label: 'Framer', icon: SiFramer, color: '#0055FF' },
  wix: {
    label: 'Wix Studio',
    icon: monogram({ bg: '#000', fg: '#fff', short: 'W', long: 'Wix', outline: true }),
    color: null, hasBackground: true,
  },
  php: { label: 'PHP', icon: monogram({ bg: '#777BB4', fg: '#fff', short: 'P', long: 'php', shape: 'oval' }), color: null, hasBackground: true },
  tailwind: { label: 'Tailwind CSS', icon: SiTailwindcss, color: '#06B6D4' },
  gsap: { label: 'GSAP', icon: monogram({ bg: '#0AE448', fg: '#0E100F', short: 'GS', long: 'GS' }), color: null, hasBackground: true },
  react: { label: 'React', icon: SiReact, color: '#087EA4' },
  nextjs: { label: 'Next.js', icon: SiNextdotjs, color: null },
  nodejs: { label: 'Node.js', icon: SiNodedotjs, color: '#5FA04E' },
  mongodb: { label: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  figma: { label: 'Figma', icon: SiFigma, color: '#F24E1E' },
  make: { label: 'Make.com', icon: SiMake, color: '#6D00CC' },
  n8n: { label: 'n8n', icon: monogram({ bg: '#EA4B71', fg: '#fff', short: 'n8', long: 'n8n' }), color: null, hasBackground: true },
  stripe: { label: 'Stripe', icon: SiStripe, color: '#635BFF' },
  memberstack: {
    label: 'Memberstack',
    icon: monogram({ bg: '#26262B', fg: '#fff', short: 'M', long: 'Ms', outline: true }),
    color: null, hasBackground: true,
  },
  airtable: { label: 'Airtable', icon: SiAirtable, color: '#18BFFF' },
  javascript: { label: 'JavaScript', icon: SiJavascript, color: '#E8C900' },
  express: { label: 'Express', icon: SiExpress, color: null },
}
