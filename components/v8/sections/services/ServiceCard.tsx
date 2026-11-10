import Link from 'next/link'
import { Check } from 'lucide-react'
import type { Service } from '@/content/v8/types'
import { TECH } from '@/lib/v8/tech'
import Reveal from '../../ui/Reveal'
import TechIcon from '../../ui/TechIcon'
import { renderRich } from '../../ui/RichText'

/**
 * Service card — `deep` (brand), `plain` (neutral) or `accent` (ember).
 * Figma Interaction 05: lifts 4px on hover with a brighter border, the whole
 * card is a link (stretched from the title), logo chips show their name.
 */
export default function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  const title = service.title.replace('\n', ' ')
  const isRoute = service.href.startsWith('/')

  return (
    <Reveal as="article" delay={delay} className={`v8-service v8-service--${service.variant} v8-spotlight`}>
      {service.badge && <span className="v8-service__badge">{service.badge}</span>}

      <ul className="v8-service__stack" aria-label="Built with">
        {service.stack.map((tech) => (
          <li key={tech} className="v8-service__chip" data-tooltip={TECH[tech].label}>
            <TechIcon tech={tech} size={26} />
            <span className="v8-sr-only">{TECH[tech].label}</span>
          </li>
        ))}
      </ul>

      <h3 className="v8-service__title">
        {isRoute ? (
          <Link href={service.href} className="v8-service__link" aria-label={title}>
            {renderRich(service.title)}
          </Link>
        ) : (
          <a href={service.href} className="v8-service__link" aria-label={title}>
            {renderRich(service.title)}
          </a>
        )}
      </h3>
      <p className="v8-service__desc">{service.description}</p>

      <hr className="v8-service__divider" />

      <ul className="v8-service__features">
        {service.features.map((feature) => (
          <li key={feature}>
            <Check className="v8-service__check" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <p className="v8-service__best">{service.bestFor}</p>
    </Reveal>
  )
}
