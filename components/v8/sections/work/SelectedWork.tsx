import { projects, workSection } from '@/content/v8/projects'
import { sectionIds } from '@/content/v8/site'
import SectionHeader from '../../ui/SectionHeader'
import Reveal from '../../ui/Reveal'
import { ButtonLink } from '../../ui/Button'
import ProjectCard from './ProjectCard'
import '@/styles/v8/sections/SelectedWork.scss'

export default function SelectedWork() {
  const featured = projects.find((p) => p.featured) ?? projects[0]
  const rest = projects.filter((p) => p !== featured)

  return (
    <section id={sectionIds.work} className="v8-section v8-section--raised v8-work" aria-labelledby="v8-work-title">
      <div className="v8-container">
        <SectionHeader id="v8-work-title" eyebrow={workSection.eyebrow} title={workSection.title} intro={workSection.intro} />

        <ProjectCard project={featured} variant="featured" />

        <div className="v8-work__grid">
          {rest.map((project, i) => (
            <ProjectCard key={project.slug} project={project} delay={i * 0.08} />
          ))}
        </div>

        <Reveal className="v8-work__footer">
          <p>{workSection.footerNote}</p>
          <ButtonLink href={workSection.allProjects.href} variant="secondary" className="v8-work__all">
            {workSection.allProjects.label}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  )
}
