import { site } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { ButtonLink } from './Button'
import Reveal from './Reveal'
import { renderRich } from './RichText'
import CopyEmailChip from '../sections/contact/CopyEmailChip'
import '@/styles/v8/sections/Contact.scss'
import '@/styles/v8/ui/CtaBand.scss'

interface CtaBandProps {
  title?: string
  text?: string
  /** Main button; defaults to "Get a free quote" → contact page. */
  action?: { label: string; href: string }
  /** Optional second button (outlined). */
  secondary?: { label: string; href: string }
  /** Show the copyable email chip (off where the email is already on the page). */
  showEmail?: boolean
}

/** Closing call-to-action at the bottom of inner pages: a main button, optional second button and copyable email. */
export default function CtaBand({
  title = 'Have a project *in mind?*',
  text = 'Share a Figma file, a rough brief or just the idea. You get a reply within 24 hours with next steps and a fixed quote.',
  action = { label: 'Get a free quote', href: routes.contact },
  secondary,
  showEmail = true,
}: CtaBandProps) {
  return (
    <section className="v8-cta-band" aria-labelledby="v8-cta-title">
      <div className="v8-container">
        <Reveal className="v8-cta-band__card">
          <div className="v8-cta-band__copy">
            <h2 id="v8-cta-title" className="v8-cta-band__title">
              {renderRich(title)}
            </h2>
            <p className="v8-cta-band__text">{text}</p>
          </div>
          <div className="v8-cta-band__actions">
            <ButtonLink href={action.href} arrow glow>
              {action.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="secondary" className="v8-cta-band__secondary">
                {secondary.label}
              </ButtonLink>
            )}
            {showEmail && <CopyEmailChip email={site.email} />}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
