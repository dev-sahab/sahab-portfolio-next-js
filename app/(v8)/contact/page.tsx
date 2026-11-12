import PageHero from '@/components/v8/ui/PageHero'
import Reveal from '@/components/v8/ui/Reveal'
import QuoteForm from '@/components/v8/sections/contact/QuoteForm'
import ContactTerminal from '@/components/v8/pages/contact/ContactTerminal'
import Accordion from '@/components/v8/sections/faq/Accordion'
import SectionHeader from '@/components/v8/ui/SectionHeader'
import CtaBand from '@/components/v8/ui/CtaBand'
import { ButtonLink } from '@/components/v8/ui/Button'
import { faqs } from '@/content/v8/faq'
import { contactSection } from '@/content/v8/contact'
import { contactPage } from '@/content/v8/pages'
import { site, socials } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { pageMetadata } from '@/lib/v8/seo'
import '@/styles/v8/sections/Contact.scss'
import '@/styles/v8/sections/Faq.scss'
import '@/styles/v8/pages/Contact.scss'

export const metadata = pageMetadata({ title: 'Hire a Freelance Web Developer · Free Quote', description: contactPage.description, path: routes.contact })

export default function ContactPage() {
  const profiles = socials.filter((s) => s.kind !== 'email')

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Contact', href: routes.contact }]}
        eyebrow="Hire a freelance web developer"
        title={'Hire a web developer.\n*Get a plan in 24 hours.*'}
        intro={contactSection.intro}
      />

      <section className="v8-section v8-contact-page" aria-label="Get a quote">
        <div className="v8-container v8-contact-page__grid">
          <Reveal className="v8-contact-page__form">
            <QuoteForm />
          </Reveal>

          <aside className="v8-contact-page__aside" aria-label="Other ways to reach me">
            <Reveal className="v8-contact-card">
              <h2 className="v8-contact-card__label">What happens next</h2>
              <ol className="v8-steps">
                {contactPage.steps.map((step, i) => (
                  <li key={step.title}>
                    <span className="v8-steps__num">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.06}>
              <ContactTerminal
                email={site.email}
                timeZone={contactPage.timeZone}
                location={contactPage.location}
                utcOffset="UTC+6"
                links={profiles.map((p) => ({ label: p.href.replace(/^https?:\/\//, ''), href: p.href }))}
              />
            </Reveal>
          </aside>
        </div>
      </section>

      <section className="v8-section v8-section--raised v8-faq" aria-labelledby="v8-contact-faq">
        <div className="v8-container v8-faq__row">
          <div className="v8-faq__aside">
            <SectionHeader
              id="v8-contact-faq"
              eyebrow="Before you send"
              title={'Quick answers,\n*first.*'}
              intro="What people usually ask before their first message."
              layout="stacked"
            />
            <Reveal>
              <ButtonLink href={routes.faq} variant="secondary" arrow>
                All questions
              </ButtonLink>
            </Reveal>
          </div>
          <Reveal delay={0.08} className="v8-faq__list">
            <Accordion items={faqs.filter((f) => ['cost', 'timeline', 'design-first', 'editing'].includes(f.id))} />
          </Reveal>
        </div>
      </section>

      <div className="v8-contact-cta">
        <CtaBand
          title={'Want to see the work *first?*'}
          text="Browse recent client sites: service businesses, online stores and landing pages, all live and in use."
          action={{ label: 'View projects', href: routes.projects }}
          secondary={{ label: 'About me', href: routes.about }}
          showEmail={false}
        />
      </div>
    </>
  )
}
