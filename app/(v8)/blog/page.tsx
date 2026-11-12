import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import BlogBrowser from '@/components/v8/pages/blog/BlogBrowser'
import { getPosts } from '@/lib/v8/data'
import { getSiteSettings } from '@/lib/publicData'
import { routes } from '@/lib/v8/routes'
import { pageMetadata } from '@/lib/v8/seo'
import '@/styles/v8/sections/SelectedWork.scss'
import '@/styles/v8/pages/Projects.scss'
import '@/styles/v8/pages/Blog.scss'

export const revalidate = 3600

const DESCRIPTION =
  'A web development blog by a working freelance developer: practical notes on WordPress, Webflow, site speed and SEO from 300+ client projects.'

export const metadata = pageMetadata({ title: 'Web Development Blog: WordPress, Webflow & Site Speed', description: DESCRIPTION, path: routes.blog })

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()])
  const columns: 2 | 3 = settings?.blogColumns === 2 ? 2 : 3
  const lead = posts.find((p) => p.featured) ?? posts[0]
  const topics = [...new Set(posts.map((p) => p.category?.name).filter(Boolean))]

  return (
    <>
      <PageHero
        crumbs={[{ label: 'Blog', href: routes.blog }]}
        eyebrow="Web development blog"
        title={'Web development notes\n*from real client work.*'}
        intro="Practical write-ups on WordPress, Webflow, site speed and SEO, plus what actually helps a small business get more from its website."
        meta={[
          { label: 'Articles', value: String(posts.length) },
          { label: 'Topics', value: topics.join(', ') || 'Web development' },
          { label: 'Written by', value: 'Sahab Uddin' },
        ]}
      />

      <section className="v8-section v8-blog" aria-label="Articles">
        <div className="v8-container">
          {lead ? (
            <BlogBrowser posts={posts} leadSlug={lead.slug} columns={columns} />
          ) : (
            <p className="v8-empty">The first articles are on the way.</p>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
