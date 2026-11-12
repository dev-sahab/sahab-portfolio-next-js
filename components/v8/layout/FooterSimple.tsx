import type { ComponentType } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { footerNav, legalNav, site, socials } from '@/content/v8/site'
import type { SocialLink } from '@/content/v8/types'
import Logo from './Logo'
import Wordmark from './Wordmark'
import Reveal from '../ui/Reveal'
import '@/styles/v8/layout/FooterSimple.scss'

const SOCIAL_ICONS: Record<SocialLink['kind'], ComponentType<{ className?: string }>> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  email: Mail,
}

function NavItem({ href, label }: { href: string; label: string }) {
  return href.startsWith('/') ? <Link href={href}>{label}</Link> : <a href={href}>{label}</a>
}

/**
 * BACKUP of the single-row footer (logo · links · socials), kept on request.
 * Not used anywhere. To switch back to it, in app/v8/layout.tsx replace
 *   import Footer from '@/components/v8/layout/Footer'
 * with
 *   import Footer from '@/components/v8/layout/FooterSimple'
 * (Uses the same class names as Footer.tsx, so never load both at once.)
 */
export default function FooterSimple() {
  return (
    <footer className="v8-footer">
      <div className="v8-footer__glow" aria-hidden="true" />
      <div className="v8-container">
        {/* Each piece rises in on scroll, one after another (same reveal as the sections). */}
        <div className="v8-footer__top">
          <Reveal>
            <Logo />
          </Reveal>
          <Reveal as="nav" delay={0.1} aria-label="Footer" className="v8-footer__nav">
            {footerNav.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </Reveal>
          <Reveal as="ul" delay={0.2} className="v8-footer__socials">
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
          </Reveal>
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
          </nav>
        </Reveal>
      </div>
    </footer>
  )
}
