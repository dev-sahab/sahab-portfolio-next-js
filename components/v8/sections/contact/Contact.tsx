import { contactSection } from '@/content/v8/contact'
import { sectionIds, site } from '@/content/v8/site'
import SectionHeader from '../../ui/SectionHeader'
import Reveal from '../../ui/Reveal'
import QuoteForm from './QuoteForm'
import CopyEmailChip from './CopyEmailChip'
import '@/styles/v8/sections/Contact.scss'

export default function Contact() {
  return (
    <section id={sectionIds.contact} className="v8-contact" aria-labelledby="v8-contact-title">
      <div className="v8-container v8-contact__inner">
        <SectionHeader
          id="v8-contact-title"
          eyebrow={contactSection.eyebrow}
          title={contactSection.title}
          intro={contactSection.intro}
          layout="center"
        />

        <Reveal className="v8-contact__form">
          <QuoteForm />
        </Reveal>

        <Reveal className="v8-contact__email">
          <span>{contactSection.emailLabel}</span>
          <CopyEmailChip email={site.email} />
        </Reveal>
      </div>
    </section>
  )
}
