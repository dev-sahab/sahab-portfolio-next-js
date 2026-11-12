import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import ProjectsBrowser from '@/components/v8/pages/projects/ProjectsBrowser'
import { getProjects } from '@/lib/v8/data'
import { routes } from '@/lib/v8/routes'
import { pageMetadata } from '@/lib/v8/seo'
import { TECH } from '@/lib/v8/tech'
import '@/styles/v8/sections/SelectedWork.scss'
import '@/styles/v8/pages/Projects.scss'

// Static, refreshed hourly and whenever a project is saved in the dashboard.
export const revalidate = 3600

const DESCRIPTION =
  'Web development portfolio of Sahab Uddin: WordPress, WooCommerce and Webflow websites for service businesses, online stores and landing pages, all live.'

export const metadata = pageMetadata({ title: 'Web Development Portfolio: WordPress & Webflow Projects', description: DESCRIPTION, path: routes.projects })

export default async function ProjectsPage() {
  const projects = await getProjects()
  // The grid only needs card data; leave the long write-ups on the server.
  const cards = projects.map(({ content: _c, gallery: _g, ...card }) => card)
  const platforms = [...new Set(projects.flatMap((p) => p.stack.map((k) => TECH[k].label)))].slice(0, 4)

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Projects', href: routes.projects }]}
        eyebrow="Web development portfolio"
        title={'Web development work,\n*live and in use.*'}
        intro="Recent websites I built for clients on WordPress, WooCommerce and Webflow. Hover a screen to scroll the whole page, or open a project for the details."
        meta={[
          { label: 'Shown here', value: `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}` },
          { label: 'Delivered overall', value: '300+ projects' },
          { label: 'Platforms', value: platforms.join(', ') || 'WordPress, Webflow' },
          { label: 'Rating', value: '5.0 across 200+ reviews' },
        ]}
      />

      <section className="v8-section v8-projects" aria-label="Projects">
        <div className="v8-container">
          {projects.length ? (
            <ProjectsBrowser projects={cards} />
          ) : (
            <p className="v8-empty">Projects are being added. Check back soon, or ask for examples on a call.</p>
          )}
        </div>
      </section>

      <CtaBand title={'Want a site *like these?*'} />
    </>
  )
}
