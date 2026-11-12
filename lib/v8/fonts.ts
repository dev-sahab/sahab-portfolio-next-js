import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'

/**
 * The v8 type system, shared by the v8 site, the dashboard and the login
 * page: Bricolage Grotesque (display), Instrument Serif italic (accent),
 * Geist (body) and Geist Mono (labels). Self-hosted by next/font, so no
 * request goes to Google at runtime.
 */
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  axes: ['opsz'],
})

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument',
  display: 'swap',
})

export const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
export const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

/** All four font variables, for a root element's className. */
export const v8FontVars = `${bricolage.variable} ${instrumentSerif.variable} ${geist.variable} ${geistMono.variable}`
