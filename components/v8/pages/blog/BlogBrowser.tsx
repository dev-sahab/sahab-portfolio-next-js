'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { PostSummary } from '@/content/v8/types'
import { cx } from '@/lib/v8/cx'
import Reveal from '../../ui/Reveal'
import { FeaturedPost, PostCard } from './PostCard'

const ALL = 'all'
/** Topics shown before the "+ more" button. */
const VISIBLE_TOPICS = 6

/** Topics = categories + tags, de-duplicated by name, most used first. */
function topicsOf(posts: PostSummary[]) {
  const counts = new Map<string, { slug: string; name: string; count: number }>()
  for (const post of posts) {
    const names = new Map<string, string>()
    if (post.category) names.set(post.category.name.toLowerCase(), post.category.name)
    for (const tag of post.tags) names.set(tag.name.toLowerCase(), tag.name)
    for (const [key, name] of names) {
      const entry = counts.get(key) ?? { slug: key.replace(/[^a-z0-9]+/g, '-'), name, count: 0 }
      entry.count += 1
      counts.set(key, entry)
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

const postTopics = (post: PostSummary) =>
  new Set([post.category?.name, ...post.tags.map((t) => t.name)].filter(Boolean).map((n) => n!.toLowerCase().replace(/[^a-z0-9]+/g, '-')))

/**
 * Blog listing with search + topic filter. With no filter: the lead article
 * large on top, the rest as cards. While filtering, every match is a card.
 * The filter is mirrored in the URL (?topic=…&q=…) so filtered views can be
 * shared. `columns` (2 or 3) comes from Site Settings → General → Blog page.
 */
export default function BlogBrowser({ posts, leadSlug, columns = 3 }: { posts: PostSummary[]; leadSlug?: string; columns?: 2 | 3 }) {
  const [topic, setTopic] = useState(ALL)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const topics = useMemo(() => topicsOf(posts), [posts])
  // Keep the selected topic visible even when it's one of the hidden ones.
  const shown = showAll ? topics : topics.filter((t, i) => i < VISIBLE_TOPICS || t.slug === topic)
  const hiddenCount = topics.length - shown.length

  // Restore a shared filter from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('topic')
    if (t && topics.some((x) => x.slug === t)) setTopic(t)
    setQuery(params.get('q') ?? '')
  }, [topics])

  // Keep the URL in sync without a navigation.
  useEffect(() => {
    const params = new URLSearchParams()
    if (topic !== ALL) params.set('topic', topic)
    if (query.trim()) params.set('q', query.trim())
    const search = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}`)
  }, [topic, query])

  const q = query.trim().toLowerCase()
  const filtering = topic !== ALL || q.length > 0
  const matches = posts.filter((post) => {
    if (topic !== ALL && !postTopics(post).has(topic)) return false
    if (!q) return true
    const haystack = `${post.title} ${post.excerpt} ${post.category?.name ?? ''} ${post.tags.map((t) => t.name).join(' ')}`.toLowerCase()
    return q.split(/\s+/).every((term) => haystack.includes(term))
  })

  const lead = filtering ? undefined : posts.find((p) => p.slug === leadSlug)
  const grid = lead ? matches.filter((p) => p !== lead) : matches

  return (
    <>
      <div className="v8-blog-filter">
        <label className="v8-blog-search">
          <Search aria-hidden="true" />
          <span className="v8-sr-only">Search articles</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <X aria-hidden="true" />
            </button>
          )}
        </label>

        <div className="v8-filter" role="group" aria-label="Filter articles by topic">
          {[{ slug: ALL, name: 'All topics', count: posts.length }, ...shown].map((t) => (
            <button
              key={t.slug}
              type="button"
              className={cx('v8-filter__chip', topic === t.slug && 'is-active')}
              aria-pressed={topic === t.slug}
              onClick={() => setTopic(t.slug)}
            >
              {t.name}
              <span className="v8-filter__count">{t.count}</span>
            </button>
          ))}
          {(hiddenCount > 0 || showAll) && topics.length > VISIBLE_TOPICS && (
            <button type="button" className="v8-filter__more" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
              {showAll ? 'Fewer topics' : `+ ${hiddenCount} more`}
            </button>
          )}
        </div>
      </div>

      <p className="v8-sr-only" aria-live="polite">
        {filtering ? `${matches.length} ${matches.length === 1 ? 'article' : 'articles'} found` : ''}
      </p>

      {lead && (
        <Reveal className="v8-blog__lead">
          <FeaturedPost post={lead} />
        </Reveal>
      )}

      {grid.length > 0 ? (
        <div className="v8-blog__more">
          <h2 className="v8-blog__label">{filtering ? `${matches.length} ${matches.length === 1 ? 'article' : 'articles'}` : 'More articles'}</h2>
          <div className={`v8-post-grid v8-post-grid--${columns}`}>
            {grid.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      ) : (
        filtering && (
          <div className="v8-blog__none">
            <p>No articles match that yet.</p>
            <button
              type="button"
              className="v8-filter__chip"
              onClick={() => {
                setTopic(ALL)
                setQuery('')
              }}
            >
              Clear filters
            </button>
          </div>
        )
      )}
    </>
  )
}
