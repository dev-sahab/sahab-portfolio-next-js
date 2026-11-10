import { featuredTestimonial, reviewsSection, stats, testimonials } from '@/content/v8/reviews'
import { sectionIds } from '@/content/v8/site'
import SectionHeader from '../../ui/SectionHeader'
import Reveal from '../../ui/Reveal'
import StatsRow from './StatsRow'
import '@/styles/v8/sections/Reviews.scss'

/** "Clients come back" — stats strip, featured quote, three short testimonials. */
export default function Reviews() {
  return (
    <section id={sectionIds.reviews} className="v8-section v8-reviews" aria-labelledby="v8-reviews-title">
      <div className="v8-container">
        <SectionHeader id="v8-reviews-title" eyebrow={reviewsSection.eyebrow} title={reviewsSection.title} layout="stacked" />

        <Reveal>
          <StatsRow stats={stats} />
        </Reveal>

        <Reveal as="figure" className="v8-quote v8-spotlight">
          <blockquote>
            <p>
              <span aria-hidden="true">“</span>
              {featuredTestimonial.quote}
              <span aria-hidden="true">”</span>
            </p>
          </blockquote>
          <figcaption>
            <strong>{featuredTestimonial.name}</strong>
            <span>{featuredTestimonial.role}</span>
          </figcaption>
        </Reveal>

        <div className="v8-testimonials">
          {testimonials.map((t, i) => (
            <Reveal as="figure" key={t.name} delay={i * 0.08} className="v8-testimonial v8-spotlight">
              <blockquote>
                <p>{t.quote}</p>
              </blockquote>
              <figcaption>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
