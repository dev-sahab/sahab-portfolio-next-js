import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { aboutSection } from '@/content/v8/about'
import { sectionIds } from '@/content/v8/site'
import SectionHeader from '../../ui/SectionHeader'
import Reveal from '../../ui/Reveal'
import Timeline from './Timeline'
import '@/styles/v8/sections/About.scss'

/** "Changelog" — portrait + bio beside a release-style career timeline. */
export default function About() {
  return (
    <section id={sectionIds.about} className="v8-section v8-section--raised v8-about" aria-labelledby="v8-about-title">
      <div className="v8-container">
        <SectionHeader id="v8-about-title" eyebrow={aboutSection.eyebrow} title={aboutSection.title} layout="stacked" />

        <div className="v8-about__row">
          <Reveal className="v8-about__me">
            <div className="v8-about__portrait">
              <Image src={aboutSection.portrait.src} alt={aboutSection.portrait.alt} fill sizes="(max-width: 960px) 100vw, 320px" />
            </div>
            <p className="v8-about__bio">{aboutSection.bio}</p>
            <Link href={aboutSection.storyLink.href} className="v8-about__story">
              {aboutSection.storyLink.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>

          <Timeline />
        </div>
      </div>
    </section>
  )
}
