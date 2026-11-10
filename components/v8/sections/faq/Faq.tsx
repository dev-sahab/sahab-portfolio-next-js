import { Mail } from 'lucide-react'
import { faqs, faqSection } from '@/content/v8/faq'
import { sectionIds, site } from '@/content/v8/site'
import SectionHeader from '../../ui/SectionHeader'
import Reveal from '../../ui/Reveal'
import Accordion from './Accordion'
import '@/styles/v8/sections/Faq.scss'

export default function Faq() {
  return (
    <section id={sectionIds.faq} className="v8-section v8-section--raised v8-faq" aria-labelledby="v8-faq-title">
      <div className="v8-container v8-faq__row">
        <div className="v8-faq__aside">
          <SectionHeader
            id="v8-faq-title"
            eyebrow={faqSection.eyebrow}
            title={faqSection.title}
            intro={faqSection.intro}
            layout="stacked"
          />
          <Reveal>
            <a href={`mailto:${site.email}`} className="v8-faq__email">
              <Mail aria-hidden="true" />
              {site.email}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.08} className="v8-faq__list">
          <Accordion items={faqs} />
        </Reveal>
      </div>
    </section>
  )
}
