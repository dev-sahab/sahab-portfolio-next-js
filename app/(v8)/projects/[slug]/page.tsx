import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import JsonLd from '@/components/v8/ui/JsonLd'
import Reveal from '@/components/v8/ui/Reveal'
import TechIcon from '@/components/v8/ui/TechIcon'
import { ButtonLink } from '@/components/v8/ui/Button'
import ProjectShowcase from '@/components/v8/pages/projects/ProjectShowcase'
import { getProject, getProjects } from '@/lib/v8/data'
import { routes } from '@/lib/v8/routes'
import { pageMetadata, projectSchema } from '@/lib/v8/seo'
import { TECH } from '@/lib/v8/tech'
import '@/styles/v8/sections/SelectedWork.scss'
import '@/styles/v8/ui/Prose.scss'
import '@/styles/v8/pages/ProjectDetail.scss'

export const revalidate = 3600

type Params = { params: Promise<{ slug: string }> }

// Prebuild every published project; new ones render on first visit, then cache.
export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Project not found', robots: { index: false } }
  const platform = project.stack[0] ? TECH[project.stack[0]].label : 'Website'
  return pageMetadata({
    // e.g. "Hightailpet: WordPress Website Project": a long-tail search, not just the name.
    title: `${project.title}: ${platform} Website Project`,
    description: (project.summary.length > 155 ? `${project.summary.slice(0, 152).replace(/\s+\S*$/, '')}…` : project.summary),
    path: routes.project(project.slug),
    image: project.image || undefined,
    noIndex: project.noIndex,
  })
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const [project, all] = await Promise.all([getProject(slug), getProjects()])
  if (!project) notFound()

  // Previous / next in the same order as the projects page, wrapping around.
  const index = all.findIndex((p) => p.slug === project.slug)
  const prev = all.length > 1 && index !== -1 ? all[(index - 1 + all.length) % all.length] : null
  const next = all.length > 1 && index !== -1 ? all[(index + 1) % all.length] : null

  const platforms = [...project.stack.map((k) => TECH[k].label), ...(project.stackExtra ?? [])]
  const gallery = project.gallery.filter((src) => src !== project.image)

  // Spec card lines ("project.json"): only the fields that exist.
  const spec: [string, string][] = [
    ['name', project.title],
    ['type', project.category],
    ['year', project.year],
    ...(project.client ? [['client', project.client] as [string, string]] : []),
    ...(project.duration ? [['duration', project.duration] as [string, string]] : []),
    ['stack', platforms.join(', ')],
    ...(project.liveUrl ? [['live', project.domain] as [string, string]] : []),
  ]

  return (
    <>
      <PageHero
        size="compact"
        crumbs={[
          { label: 'Projects', href: routes.projects },
          { label: project.title, href: routes.project(project.slug) },
        ]}
        eyebrow={`${project.category} · ${project.year}`}
        title={project.title}
        intro={project.summary}
        meta={[
          ...(project.client ? [{ label: 'Client', value: project.client }] : []),
          { label: 'Year', value: project.year },
          ...(project.duration ? [{ label: 'Timeline', value: project.duration }] : []),
          {
            label: 'Built with',
            value: (
              <span className="v8-detail-stack">
                {project.stack.map((k) => (
                  <span key={k}>
                    <TechIcon tech={k} size={16} />
                    {TECH[k].label}
                  </span>
                ))}
                {project.stackExtra?.map((name) => <span key={name}>{name}</span>)}
              </span>
            ),
          },
        ]}
      >
        {project.liveUrl && (
          <ButtonLink href={project.liveUrl} variant="inverse" external>
            Visit live site
          </ButtonLink>
        )}
        <ButtonLink href={routes.projects} variant="secondary">
          All projects
        </ButtonLink>
      </PageHero>

      <section className="v8-detail" aria-label={`${project.title} screenshot`}>
        <div className="v8-container">
          <Reveal>
            <ProjectShowcase domain={project.domain} src={project.image} alt={project.imageAlt} />
          </Reveal>
        </div>
      </section>

      <section className="v8-section v8-detail-body" aria-labelledby="v8-detail-about">
        <div className="v8-container v8-detail-body__grid">
          <article className="v8-detail-body__main">
            <h2 id="v8-detail-about" className="v8-detail-body__label">
              About the project
            </h2>
            {project.content ? (
              <div className="v8-prose" dangerouslySetInnerHTML={{ __html: project.content }} />
            ) : (
              <div className="v8-prose">
                <p>{project.summary}</p>
              </div>
            )}

            {gallery.length > 0 && (
              <div className="v8-detail-gallery">
                <h2 className="v8-detail-body__label">More screens</h2>
                <ul>
                  {gallery.map((src, i) => (
                    <li key={src}>
                      <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Open screen ${i + 1} full size`}>
                        <Image src={src} alt={`${project.title}, screen ${i + 1}`} width={1200} height={900} sizes="(max-width: 960px) 100vw, 560px" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          <aside className="v8-detail-body__aside" aria-label="Project details">
            <div className="v8-spec">
              <div className="v8-spec__bar" aria-hidden="true">
                <span className="v8-spec__dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>{project.slug}.json</span>
              </div>
              <dl className="v8-spec__body">
                {spec.map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>
                      {key === 'live' && project.liveUrl ? (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {prev && next && (
        <nav className="v8-pager v8-container" aria-label="More projects">
          <Link href={routes.project(prev.slug)} className="v8-pager__link">
            <span className="v8-pager__dir">
              <ArrowLeft aria-hidden="true" /> Previous
            </span>
            <span className="v8-pager__title">{prev.title}</span>
          </Link>
          <Link href={routes.project(next.slug)} className="v8-pager__link v8-pager__link--next">
            <span className="v8-pager__dir">
              Next <ArrowRight aria-hidden="true" />
            </span>
            <span className="v8-pager__title">{next.title}</span>
          </Link>
        </nav>
      )}

      <CtaBand title={'Want something *similar?*'} />

      <JsonLd data={projectSchema(project)} />
    </>
  )
}
