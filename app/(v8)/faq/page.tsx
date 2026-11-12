import { Mail } from 'lucide-react'
import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import JsonLd from '@/components/v8/ui/JsonLd'
import Reveal from '@/components/v8/ui/Reveal'
import Accordion from '@/components/v8/sections/faq/Accordion'
import { faqSection } from '@/content/v8/faq'
import { faqPage } from '@/content/v8/pages'
import { site } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { faqSchema, pageMetadata } from '@/lib/v8/seo'
import '@/styles/v8/sections/Faq.scss'
import '@/styles/v8/pages/Faq.scss'

export const metadata = pageMetadata({ title: 'Web Development FAQ: Cost, Timelines & Platforms', description: faqPage.description, path: routes.faq })

export default function FaqPage() {
  const total = faqPage.groups.reduce((n, g) => n + g.items.length, 0)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'FAQ', href: routes.faq }]}
        eyebrow="Web development FAQ"
        title={'Questions about\n*your new website.*'}
        intro={faqSection.intro}
        meta={[
          { label: 'Questions', value: String(total) },
          { label: 'Topics', value: faqPage.groups.map((g) => g.title).join(', ') },
        ]}
      />

      <section className="v8-section v8-faq-page" aria-label="Questions and answers">
        <div className="v8-container v8-faq-page__grid">
          <nav className="v8-faq-page__nav" aria-label="FAQ topics">
            <p className="v8-faq-page__label">Topics</p>
            <ol>
              {faqPage.groups.map((group, i) => (
                <li key={group.id}>
                  <a href={`#${group.id}`}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {group.title}
                  </a>
                </li>
              ))}
            </ol>
            <a href={`mailto:${site.email}`} className="v8-faq__email">
              <Mail aria-hidden="true" />
              {site.email}
            </a>
          </nav>

          <div className="v8-faq-page__groups">
            {faqPage.groups.map((group, i) => (
              <Reveal key={group.id} className="v8-faq-page__group">
                <h2 id={group.id} className="v8-faq-page__title">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {group.title}
                </h2>
                <Accordion items={group.items} defaultOpen={i === 0 ? 0 : null} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={'Still have *a question?*'} text="Send it over by email or through the quote form. You’ll get a straight answer within 24 hours." />

      <JsonLd data={faqSchema(faqPage.groups.flatMap((g) => g.items))} />
    </>
  )
}
