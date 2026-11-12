import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import PageHero from '@/components/v8/ui/PageHero'
import CtaBand from '@/components/v8/ui/CtaBand'
import JsonLd from '@/components/v8/ui/JsonLd'
import ShareRow from '@/components/v8/pages/blog/ShareRow'
import Toc from '@/components/v8/ui/Toc'
import { PostCard } from '@/components/v8/pages/blog/PostCard'
import { aboutSection } from '@/content/v8/about'
import { site } from '@/content/v8/site'
import { getPost, getPosts } from '@/lib/v8/data'
import { formatDate } from '@/lib/v8/format'
import { absoluteUrl, routes } from '@/lib/v8/routes'
import { articleSchema, pageMetadata } from '@/lib/v8/seo'
import '@/styles/v8/sections/SelectedWork.scss'
import '@/styles/v8/ui/Prose.scss'
import '@/styles/v8/pages/Blog.scss'

export const revalidate = 3600

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Article not found', robots: { index: false } }
  return pageMetadata({
    title: post.title,
    description: post.excerpt.length > 155 ? `${post.excerpt.slice(0, 152).replace(/\s+\S*$/, '')}…` : post.excerpt,
    path: routes.post(post.slug),
    image: post.coverImage,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  })
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params
  const [post, all] = await Promise.all([getPost(slug), getPosts()])
  if (!post) notFound()

  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3)
  const url = absoluteUrl(routes.post(post.slug))
  const updated = formatDate(post.updatedAt)
  const showUpdated = updated && updated !== formatDate(post.publishedAt)

  return (
    <>
      <PageHero
        size="compact"
        className="v8-article-hero"
        crumbs={[
          { label: 'Blog', href: routes.blog },
          { label: post.title, href: routes.post(post.slug) },
        ]}
        eyebrow={post.category?.name ?? 'Article'}
        title={post.title}
        intro={post.excerpt}
      >
        <div className="v8-byline">
          <Image src={aboutSection.portrait.src} alt="" width={44} height={44} className="v8-byline__avatar" />
          <div>
            <p className="v8-byline__name">{site.name}</p>
            <p className="v8-post-meta">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, 'long')}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readTime} min read</span>
              {showUpdated && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Updated <time dateTime={post.updatedAt}>{updated}</time>
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </PageHero>

      {post.coverImage && (
        <div className="v8-container">
          <div className="v8-article-cover">
            <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 1344px) 100vw, 1280px" preload />
          </div>
        </div>
      )}

      <div className={`v8-container v8-article${post.toc.length > 1 ? ' v8-article--toc' : ''}`}>
        {post.toc.length > 1 && <Toc items={post.toc} />}

        <article className="v8-article__body">
          <div className="v8-prose" dangerouslySetInnerHTML={{ __html: post.content }} />

          <footer className="v8-article__footer">
            {post.tags.length > 0 && (
              <ul className="v8-article__tags" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag.slug} className="v8-tag">
                    #{tag.name}
                  </li>
                ))}
              </ul>
            )}
            <ShareRow url={url} title={post.title} />
          </footer>

          <aside className="v8-author" aria-label="About the author">
            <Image src={aboutSection.portrait.src} alt={aboutSection.portrait.alt} width={72} height={72} className="v8-author__photo" />
            <div>
              <p className="v8-author__name">Written by {site.name}</p>
              <p className="v8-author__bio">{aboutSection.bio}</p>
              <Link href={routes.about} className="v8-link">
                More about me <ArrowRight className="v8-link__icon" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </article>
      </div>

      {related.length > 0 && (
        <section className="v8-container v8-related" aria-labelledby="v8-related-title">
          <h2 id="v8-related-title" className="v8-blog__label">
            Keep reading
          </h2>
          <div className="v8-post-grid v8-post-grid--3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}

      <CtaBand />

      <JsonLd data={articleSchema(post)} />
    </>
  )
}
