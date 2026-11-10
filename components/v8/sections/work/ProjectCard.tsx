'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Project } from '@/content/v8/types'
import { TECH } from '@/lib/v8/tech'
import { cx } from '@/lib/v8/cx'
import { ButtonLink } from '../../ui/Button'
import Reveal from '../../ui/Reveal'
import TechIcon from '../../ui/TechIcon'
import BrowserFrame, { type BrowserFrameHandle } from './BrowserFrame'

interface ProjectCardProps {
  project: Project
  variant?: 'featured' | 'standard'
  delay?: number
}

/**
 * A project: browser-framed screenshot + details. Hovering (or focusing)
 * anywhere on the card scrolls the full-page screenshot, as in the HTML
 * prototype.
 */
export default function ProjectCard({ project, variant = 'standard', delay = 0 }: ProjectCardProps) {
  const frame = useRef<BrowserFrameHandle>(null)
  const cursor = useRef<HTMLSpanElement>(null)
  const featured = variant === 'featured'

  return (
    <Reveal delay={delay} className={cx('v8-project', featured && 'v8-project--featured')}>
      <article
        id={`project-${project.slug}`}
        className="v8-project__inner"
        onMouseEnter={() => frame.current?.scrollDown()}
        onMouseLeave={() => frame.current?.scrollBack()}
        onFocus={() => frame.current?.scrollDown()}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && frame.current?.scrollBack()}
      >
        <Link
          href={project.caseStudyHref}
          className="v8-project__media"
          aria-label={`${project.title} case study`}
          tabIndex={-1}
          onMouseMove={(e) => {
            const el = cursor.current
            if (!el) return
            const box = e.currentTarget.getBoundingClientRect()
            el.style.transform = `translate(${e.clientX - box.left - el.offsetWidth / 2}px, ${e.clientY - box.top - el.offsetHeight / 2}px)`
            el.classList.add('is-visible')
          }}
          onMouseLeave={() => cursor.current?.classList.remove('is-visible')}
        >
          <BrowserFrame ref={frame} domain={project.domain} src={project.image} alt={project.imageAlt} priority={featured} />
          <span ref={cursor} className="v8-project__cursor" aria-hidden="true">
            <ArrowUpRight />
            View
          </span>
        </Link>

        <div className="v8-project__details">
          <div className="v8-project__title-row">
            <h3 className="v8-project__title">{project.title}</h3>
            <span className="v8-project__year">{project.year}</span>
          </div>
          <p className="v8-project__summary">{project.summary}</p>

          <ul className="v8-project__tags" aria-label="Project type and stack">
            <li className="v8-tag v8-tag--filled">{project.category}</li>
            {project.stack.map((tech) => (
              <li key={tech} className="v8-tag">
                <TechIcon tech={tech} size={18} variant="badge" />
                {TECH[tech].label}
              </li>
            ))}
          </ul>

          <div className="v8-project__actions">
            {featured ? (
              <ButtonLink href={project.caseStudyHref} variant="inverse" arrow>
                Read case study
              </ButtonLink>
            ) : (
              <Link href={project.caseStudyHref} className="v8-link">
                Case study <ArrowRight className="v8-link__icon" aria-hidden="true" />
              </Link>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="v8-link">
                {featured ? 'Visit live site' : 'Live site'}
                <ArrowUpRight className="v8-link__icon" aria-hidden="true" />
                <span className="v8-sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  )
}
