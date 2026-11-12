import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { PostSummary } from '@/content/v8/types'
import { routes } from '@/lib/v8/routes'
import { formatDate } from '@/lib/v8/format'

/** Large lead article: cover on the left, details on the right. */
export function FeaturedPost({ post, headingLevel = 'h2' }: { post: PostSummary; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <article className="v8-post-feature v8-spotlight">
      <Link href={routes.post(post.slug)} className="v8-post-feature__media" tabIndex={-1} aria-hidden="true">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 960px) 100vw, 600px" preload />
        ) : (
          <span className="v8-post-feature__placeholder">{post.category?.name ?? 'Notes'}</span>
        )}
      </Link>
      <div className="v8-post-feature__body">
        <p className="v8-post-meta">
          <span className="v8-post-meta__badge">Latest</span>
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime} min read</span>
        </p>
        <Heading className="v8-post-feature__title">
          <Link href={routes.post(post.slug)}>{post.title}</Link>
        </Heading>
        <p className="v8-post-feature__excerpt">{post.excerpt}</p>
        <span className="v8-link" aria-hidden="true">
          Read article <ArrowRight className="v8-link__icon" />
        </span>
      </div>
    </article>
  )
}

/** Grid card: cover image, topic · date · read time, title, short excerpt. The whole card is clickable. */
export function PostCard({ post, headingLevel = 'h2' }: { post: PostSummary; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <article className="v8-post-card v8-spotlight">
      <div className="v8-post-card__media">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 380px" />
        ) : (
          <span className="v8-post-feature__placeholder">{post.category?.name ?? 'Notes'}</span>
        )}
        {post.category && <span className="v8-post-card__topic">{post.category.name}</span>}
      </div>
      <div className="v8-post-card__body">
        <p className="v8-post-meta">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime} min read</span>
        </p>
        <Heading className="v8-post-card__title">
          <Link href={routes.post(post.slug)}>{post.title}</Link>
        </Heading>
        <p className="v8-post-card__excerpt">{post.excerpt}</p>
        <span className="v8-post-card__more" aria-hidden="true">
          Read article <ArrowRight />
        </span>
      </div>
    </article>
  )
}
