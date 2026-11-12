import Image from 'next/image'
import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import JsonLd from '@/components/v8/ui/JsonLd'
import Reveal from '@/components/v8/ui/Reveal'
import SectionHeader from '@/components/v8/ui/SectionHeader'
import StatsRow from '@/components/v8/sections/reviews/StatsRow'
import Timeline from '@/components/v8/sections/about/Timeline'
import ToolsMarquee from '@/components/v8/sections/tools/ToolsMarquee'
import { aboutSection } from '@/content/v8/about'
import { aboutPage } from '@/content/v8/pages'
import { stats } from '@/content/v8/reviews'
import { routes } from '@/lib/v8/routes'
import { pageMetadata, personSchema } from '@/lib/v8/seo'
import '@/styles/v8/sections/Reviews.scss'
import '@/styles/v8/pages/About.scss'

export const metadata = pageMetadata({
  title: 'About Me: Freelance Web & WordPress Developer',
  description: aboutPage.description,
  path: routes.about,
  image: aboutSection.portrait.src,
})

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: 'About', href: routes.about }]}
        eyebrow="About"
        title={aboutPage.title}
        intro={aboutSection.bio}
        meta={aboutPage.now}
      />

      <section className="v8-section v8-story" aria-labelledby="v8-story-title">
        <div className="v8-container v8-story__grid">
          <Reveal className="v8-story__portrait">
            <div className="v8-story__photo">
              <Image src={aboutSection.portrait.src} alt={aboutSection.portrait.alt} fill sizes="(max-width: 960px) 100vw, 420px" preload />
              <span className="v8-story__caption">Sahab Uddin · Sylhet, Bangladesh</span>
            </div>
          </Reveal>
          <div className="v8-story__text">
            <h2 id="v8-story-title" className="v8-story__label">
              The short version
            </h2>
            {aboutPage.story.map((paragraph, i) => (
              <Reveal as="p" key={i} delay={i * 0.06} className={i === 0 ? 'v8-story__lead' : undefined}>
                {paragraph}
              </Reveal>
            ))}
            <Reveal delay={0.2}>
              <StatsRow stats={stats} />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="v8-section v8-section--raised v8-principles" aria-labelledby="v8-principles-title">
        <div className="v8-container">
          <SectionHeader
            id="v8-principles-title"
            eyebrow="How I work"
            title={'Four habits,\n*every project.*'}
            intro="How I run every project, and what clients mention most in their reviews."
          />
          <ol className="v8-principles__list">
            {aboutPage.principles.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.06} className="v8-principles__item v8-spotlight">
                <span className="v8-principles__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="v8-section v8-changelog" aria-labelledby="v8-changelog-title">
        <div className="v8-container v8-changelog__grid">
          <SectionHeader
            id="v8-changelog-title"
            eyebrow="Changelog"
            title={'Every role,\n*in release order.*'}
            intro="From a first hand-coded page in 2018 to leading WordPress and Webflow builds for agency clients."
            layout="stacked"
            className="v8-changelog__head"
          />
          <Timeline headingLevel="h3" />
        </div>
      </section>

      <ToolsMarquee />

      <div className="v8-about-cta">
        <CtaBand title={'Sound like a fit?\n*Let’s talk.*'} />
      </div>

      <JsonLd data={personSchema()} />
    </>
  )
}
