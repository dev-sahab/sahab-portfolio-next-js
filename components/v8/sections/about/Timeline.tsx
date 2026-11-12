import { timeline } from '@/content/v8/about'
import { cx } from '@/lib/v8/cx'
import Reveal from '../../ui/Reveal'
import '@/styles/v8/sections/About.scss'

/** Release-style career timeline ("Changelog"), shared by the homepage and the About page. */
export default function Timeline({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <ol className="v8-timeline">
      {timeline.map((entry, i) => (
        // Figma Interaction 06: each row fades in 80ms after the previous one.
        <Reveal
          as="li"
          key={entry.role}
          delay={i * 0.08}
          className={cx('v8-release', entry.current && 'is-current')}
        >
          <span className="v8-release__period">{entry.period}</span>
          <span className="v8-release__rail" aria-hidden="true">
            <i />
          </span>
          <div className="v8-release__body">
            <Heading className="v8-release__role">
              {entry.role}
              <span className="v8-release__version">{entry.version}</span>
            </Heading>
            <p className="v8-release__org">{entry.org}</p>
            <p className="v8-release__desc">{entry.description}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  )
}
