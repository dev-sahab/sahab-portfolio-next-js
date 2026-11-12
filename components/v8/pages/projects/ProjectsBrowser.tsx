'use client'

import { useMemo, useState } from 'react'
import type { Project } from '@/content/v8/types'
import { TECH } from '@/lib/v8/tech'
import { cx } from '@/lib/v8/cx'
import ProjectCard from '../../sections/work/ProjectCard'

const ALL = 'all'

/** Platform label for a project's logo key or free-text stack entry. */
const platformsOf = (p: Project) => [...p.stack.map((k) => TECH[k].label), ...(p.stackExtra ?? [])]

/**
 * Project grid with platform filter chips (from each project's stack).
 * With no filter, the first featured project gets the large layout; while
 * filtering, everything is an equal grid so results are easy to scan.
 */
export default function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState(ALL)

  const platforms = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of projects) for (const name of platformsOf(p)) counts.set(name, (counts.get(name) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [projects])

  const visible = filter === ALL ? projects : projects.filter((p) => platformsOf(p).includes(filter))
  const featured = filter === ALL ? (visible.find((p) => p.featured) ?? visible[0]) : undefined
  const rest = visible.filter((p) => p !== featured)

  return (
    <>
      {platforms.length > 1 && (
        <div className="v8-filter" role="group" aria-label="Filter projects by platform">
          {[[ALL, projects.length] as const, ...platforms].map(([name, count]) => (
            <button
              key={name}
              type="button"
              className={cx('v8-filter__chip', filter === name && 'is-active')}
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
            >
              {name === ALL ? 'All projects' : name}
              <span className="v8-filter__count">{count}</span>
            </button>
          ))}
        </div>
      )}

      <p className="v8-sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'project' : 'projects'} shown
      </p>

      {featured && <ProjectCard project={featured} variant="featured" idPrefix="" as="h2" />}

      {rest.length > 0 && (
        <div className="v8-work__grid">
          {rest.map((project, i) => (
            <ProjectCard key={project.slug} project={project} delay={(i % 2) * 0.08} idPrefix="" as="h2" />
          ))}
        </div>
      )}
    </>
  )
}
