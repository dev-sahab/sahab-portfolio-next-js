import { Link2, Pencil, ShieldCheck, Tag } from 'lucide-react'
import { projectIncludes, services, servicesSection } from '@/content/v8/services'
import { sectionIds } from '@/content/v8/site'
import SectionHeader from '../../ui/SectionHeader'
import Reveal from '../../ui/Reveal'
import ServiceCard from './ServiceCard'
import ProcessShowcase from './ProcessShowcase'
import '@/styles/v8/sections/Services.scss'

const INCLUDE_ICONS = { tag: Tag, link: Link2, pencil: Pencil, shield: ShieldCheck } as const

export default function Services() {
  return (
    <section id={sectionIds.services} className="v8-section v8-services" aria-labelledby="v8-services-title">
      <div className="v8-container">
        <SectionHeader
          id="v8-services-title"
          eyebrow={servicesSection.eyebrow}
          title={servicesSection.title}
          intro={servicesSection.intro}
        />

        <div className="v8-services__cards">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} delay={i * 0.08} />
          ))}
        </div>

        <div className="v8-services__process">
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
      </div>
    </section>
  )
}
