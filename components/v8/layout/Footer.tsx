import type { ComponentType } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { footerColumns, legalNav, site, socials } from '@/content/v8/site'
import type { SocialLink } from '@/content/v8/types'
import Logo from './Logo'
import Wordmark from './Wordmark'
import Reveal from '../ui/Reveal'
import CookieSettingsButton from '../consent/CookieSettingsButton'
import '@/styles/v8/layout/Footer.scss'

const SOCIAL_ICONS: Record<SocialLink['kind'], ComponentType<{ className?: string }>> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  email: Mail,
}

function NavItem({ href, label }: { href: string; label: string }) {
  return href.startsWith('/') ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>
}

/** Figma "Footer (D5 · peeking)": brand + link columns, clipped giant wordmark, legal bar. (Single-row version backed up in FooterSimple.tsx.) */
export default function Footer() {
  return (
    <footer className="v8-footer">
      <div className="v8-footer__glow" aria-hidden="true" />
      <div className="v8-container">
        {/* Each piece rises in on scroll, one after another (same reveal as the sections). */}
        <div className="v8-footer__top">
          <Reveal className="v8-footer__brand">
            <Logo />
            <p className="v8-footer__tagline">
              Freelance web developer building fast, SEO-friendly websites and web apps on WordPress, Webflow and Next.js for businesses and agencies. Fixed quotes, a reply within 24 hours, and support after launch.
            </p>
            <ul className="v8-footer__socials">
              {socials.map(({ kind, label, href }) => {
                const Icon = SOCIAL_ICONS[kind]
                const external = href.startsWith('http')
                return (
                  <li key={kind}>
                    <a
                      href={href}
                      aria-label={label}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <Icon className="v8-footer__social-icon" />
                    </a>
                  </li>
                )
              })}
            </ul>
          </Reveal>

          <nav aria-label="Footer" className="v8-footer__columns">
            {footerColumns.map((column, i) => (
              <Reveal key={column.title} delay={0.08 * (i + 1)} className="v8-footer__col">
                <p className="v8-footer__col-title">{column.title}</p>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <NavItem {...link} />
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </nav>
        </div>

        <Wordmark />

        <Reveal delay={0.15} className="v8-footer__bottom">
          <p>
            © {site.year} {site.legalName}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="v8-footer__legal">
            {legalNav.map((link) => (
              <NavItem key={link.label} {...link} />
            ))}
            <CookieSettingsButton />
          </nav>
        </Reveal>
      </div>
    </footer>
  )
}
