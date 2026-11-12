import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'
import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import JsonLd from '@/components/v8/ui/JsonLd'
import Reveal from '@/components/v8/ui/Reveal'
import SectionHeader from '@/components/v8/ui/SectionHeader'
import TechIcon from '@/components/v8/ui/TechIcon'
import { ButtonLink } from '@/components/v8/ui/Button'
import ProcessShowcase from '@/components/v8/sections/services/ProcessShowcase'
import Accordion from '@/components/v8/sections/faq/Accordion'
import ProjectsBrowser from '@/components/v8/pages/projects/ProjectsBrowser'
import { getServicePage, servicePages } from '@/content/v8/servicePages'
import { getProjects } from '@/lib/v8/data'
import { routes } from '@/lib/v8/routes'
import { breadcrumbSchema, faqSchema, pageMetadata, singleServiceSchema } from '@/lib/v8/seo'
import { TECH } from '@/lib/v8/tech'
import '@/styles/v8/sections/SelectedWork.scss'
import '@/styles/v8/sections/Services.scss'
import '@/styles/v8/sections/Faq.scss'
import '@/styles/v8/pages/Services.scss'
import '@/styles/v8/pages/Projects.scss'

// Copy is static; the project proof refreshes hourly with the CMS.
export const revalidate = 3600
export const dynamicParams = false

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = getServicePage((await params).slug)
  if (!page) return { title: 'Service not found', robots: { index: false } }
  return pageMetadata({ title: page.metaTitle, description: page.metaDescription, path: routes.servicePage(page.slug) })
}

export default async function ServiceLandingPage({ params }: Params) {
  const page = getServicePage((await params).slug)
  if (!page) notFound()

  const projects = await getProjects()
  const proof = projects
    .filter((p) => p.stack.some((k) => page.projectStacks.includes(k)))
    .slice(0, 4)
    .map(({ content: _c, gallery: _g, ...card }) => card)

  const others = servicePages.filter((p) => p.slug !== page.slug)

  return (
    <>
      <PageHero
        crumbs={[
          { label: 'Services', href: routes.services },
          { label: page.keyword, href: routes.servicePage(page.slug) },
        ]}
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        meta={page.meta}
      >
        <ButtonLink href={routes.contact} arrow>
          Get a free quote
        </ButtonLink>
      </PageHero>

      <section className="v8-section v8-section--raised v8-service-detail" aria-labelledby="v8-service-build">
        <div className="v8-container v8-service-detail__grid">
          <Reveal className="v8-service-detail__intro">
            <SectionHeader id="v8-service-build" eyebrow="What you get" title={page.deliverablesHeading} layout="stacked" />
            <ul className="v8-service-detail__stack" aria-label="Tools">
              {page.stack.map((tech) => (
                <li key={tech} className="v8-tag">
                  <TechIcon tech={tech} size={16} />
                  {TECH[tech].label}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08} className="v8-service-detail__card">
            <ul className="v8-service-detail__list">
              {page.deliverables.map((item) => (
                <li key={item.title}>
                  <Check aria-hidden="true" />
                  <span>
                    <strong>{item.title}.</strong> {item.text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="v8-service-detail__fit">
              <h3 className="v8-service-detail__label">A good fit if</h3>
              <ul className="v8-service-detail__list">
                {page.fit.map((line) => (
                  <li key={line}>
                    <Check aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {proof.length > 0 && (
        <section className="v8-section v8-projects" aria-labelledby="v8-service-work">
          <div className="v8-container">
            <SectionHeader
              id="v8-service-work"
              eyebrow="Recent work"
              title={`Recent ${page.keyword.replace(/ developer$/i, '')}\n*projects.*`}
              layout="stacked"
            />
            <ProjectsBrowser projects={proof} />
          </div>
        </section>
      )}

      <section className="v8-section v8-services" aria-labelledby="v8-service-process">
        <div className="v8-container v8-services__process">
          <h2 id="v8-service-process" className="v8-sr-only">
            How a project runs
          </h2>
          <ProcessShowcase />
        </div>
      </section>

      <section className="v8-section v8-section--raised v8-faq" aria-labelledby="v8-service-faq">
        <div className="v8-container v8-faq__row">
          <div className="v8-faq__aside">
            <SectionHeader
              id="v8-service-faq"
              eyebrow="FAQ"
              title={`Hiring a ${page.keyword.replace(/^White label web development$/, 'white label developer')}:\n*questions.*`}
              layout="stacked"
            />
            <Reveal>
              <ul className="v8-service-detail__list" aria-label="Other services">
                {others.map((o) => (
                  <li key={o.slug}>
                    <a href={routes.servicePage(o.slug)}>{o.eyebrow}</a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.08} className="v8-faq__list">
            <Accordion items={page.faqs} />
          </Reveal>
        </div>
      </section>

      <div className="v8-services-cta">
        <CtaBand />
      </div>

      <JsonLd
        data={[
          singleServiceSchema({ name: page.eyebrow, description: page.metaDescription, url: routes.servicePage(page.slug), serviceType: page.keyword }),
          faqSchema(page.faqs),
          breadcrumbSchema([
            { name: 'Home', path: routes.home },
            { name: 'Services', path: routes.services },
            { name: page.keyword, path: routes.servicePage(page.slug) },
          ]),
        ]}
      />
    </>
  )
}
