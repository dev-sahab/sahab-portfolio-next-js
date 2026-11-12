import { Check, Link2, Pencil, ShieldCheck, Tag } from 'lucide-react'
import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import JsonLd from '@/components/v8/ui/JsonLd'
import Reveal from '@/components/v8/ui/Reveal'
import SectionHeader from '@/components/v8/ui/SectionHeader'
import TechIcon from '@/components/v8/ui/TechIcon'
import { ButtonLink } from '@/components/v8/ui/Button'
import { renderRich } from '@/components/v8/ui/RichText'
import ServiceCard from '@/components/v8/sections/services/ServiceCard'
import ProcessShowcase from '@/components/v8/sections/services/ProcessShowcase'
import Accordion from '@/components/v8/sections/faq/Accordion'
import { projectIncludes, services } from '@/content/v8/services'
import { servicesPage } from '@/content/v8/pages'
import { faqs } from '@/content/v8/faq'
import { routes } from '@/lib/v8/routes'
import { pageMetadata, serviceSchema } from '@/lib/v8/seo'
import { TECH } from '@/lib/v8/tech'
import '@/styles/v8/sections/SelectedWork.scss'
import '@/styles/v8/sections/Services.scss'
import '@/styles/v8/sections/Faq.scss'
import '@/styles/v8/pages/Services.scss'

export const metadata = pageMetadata({ title: 'Services', description: servicesPage.description, path: routes.services })

const INCLUDE_ICONS = { tag: Tag, link: Link2, pencil: Pencil, shield: ShieldCheck } as const

export default function ServicesPage() {
  const pricingFaqs = faqs.filter((f) => ['cost', 'timeline', 'partners'].includes(f.id))

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Services', href: routes.services }]}
        eyebrow="Services"
        title={servicesPage.title}
        intro={servicesPage.intro}
        meta={servicesPage.meta}
      />

      <section className="v8-section v8-services v8-services-page" aria-label="Services overview">
        <div className="v8-container">
          <div className="v8-services__cards">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {services.map((service, i) => {
        const detail = servicesPage.details[service.id]
        const title = service.title.replace('\n', ' ')
        return (
          <section
            key={service.id}
            id={service.id}
            className={`v8-section v8-service-detail${i % 2 === 0 ? ' v8-section--raised' : ''}`}
            aria-labelledby={`v8-service-${service.id}`}
          >
            <div className="v8-container v8-service-detail__grid">
              <Reveal className="v8-service-detail__intro">
                <span className="v8-service-detail__num">{String(i + 1).padStart(2, '0')}</span>
                <h2 id={`v8-service-${service.id}`} className="v8-service-detail__title">
                  {renderRich(service.title)}
                </h2>
                <p className="v8-service-detail__desc">{service.description}</p>
                <ul className="v8-service-detail__stack" aria-label="Tools">
                  {service.stack.map((tech) => (
                    <li key={tech} className="v8-tag">
                      <TechIcon tech={tech} size={16} />
                      {TECH[tech].label}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.08} className="v8-service-detail__card">
                <h3 className="v8-service-detail__label">What you get</h3>
                <ul className="v8-service-detail__list">
                  {(detail?.deliverables ?? service.features).map((item) => (
                    <li key={item}>
                      <Check aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                {detail && (
                  <div className="v8-service-detail__fit">
                    <h3 className="v8-service-detail__label">A good fit if</h3>
                    <p>{detail.fit}</p>
                  </div>
                )}
                <ButtonLink href={routes.contact} arrow className="v8-service-detail__cta" aria-label={`Get a quote for ${title}`}>
                  Get a quote
                </ButtonLink>
              </Reveal>
            </div>
          </section>
        )
      })}

      <section className="v8-section v8-services" aria-labelledby="v8-process-heading">
        <div className="v8-container v8-services__process">
          <h2 id="v8-process-heading" className="v8-sr-only">
            How a project runs
          </h2>
          <ProcessShowcase />
          <Reveal as="ul" className="v8-includes" aria-label="Every project includes">
            {projectIncludes.map(({ icon, label }) => {
              const Icon = INCLUDE_ICONS[icon]
              return (
                <li key={label} className="v8-includes__item">
                  <Icon className="v8-includes__icon" aria-hidden="true" />
                  {label}
                </li>
              )
            })}
          </Reveal>
        </div>
      </section>

      <section className="v8-section v8-section--raised v8-faq" aria-labelledby="v8-services-faq">
        <div className="v8-container v8-faq__row">
          <div className="v8-faq__aside">
            <SectionHeader
              id="v8-services-faq"
              eyebrow="Before you ask"
              title={'Pricing and\n*timelines.*'}
              intro="The short answers. There are more on the FAQ page."
              layout="stacked"
            />
            <Reveal>
              <ButtonLink href={routes.faq} variant="secondary" arrow>
                All questions
              </ButtonLink>
            </Reveal>
          </div>
          <Reveal delay={0.08} className="v8-faq__list">
            <Accordion items={pricingFaqs} />
          </Reveal>
        </div>
      </section>

      <div className="v8-services-cta">
        <CtaBand />
      </div>

      <JsonLd
        data={serviceSchema(
          services.map((s) => ({ name: s.title.replace('\n', ' '), description: s.description, url: routes.service(s.id) })),
        )}
      />
    </>
  )
}
