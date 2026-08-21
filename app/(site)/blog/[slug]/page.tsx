import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import { sanitizeContent } from '@/lib/sanitize'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import '@/models/Tag'
import AnimatedSection from '@/components/site/AnimatedSection'
import { formatDate } from '@/lib/utils'
import type { BlogPost as IPost } from '@/types'
import './blog-slug.scss'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connection()
  const { slug } = await params
  try {
    await connectDB()
    const p = await BlogPost.findOne({ slug, published: true }).lean() as unknown as IPost
    return p ? { title: p.title, description: p.excerpt } : { title: 'Post Not Found' }
  } catch { return { title: 'Blog' } }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection()
  const { slug } = await params
  let post: IPost | null = null
  try { await connectDB(); post = await BlogPost.findOne({ slug, published: true }).populate('category').populate('tags').lean() as unknown as IPost } catch {}
  if (!post) notFound()

  return (
    <main>
      <section className="page-hero blog-post-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div className="blog-post-breadcrumb">
              <Link href="/">Home</Link><span>/</span>
              <Link href="/blog">Blog</Link><span>/</span>
              <span>{post.category?.name || 'Uncategorized'}</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div className="blog-post-meta">
              <span className="tag green">{post.category?.name || 'Uncategorized'}</span>
              <span className="blog-post-meta-item">{post.createdAt ? formatDate(post.createdAt) : ''}</span>
              <span className="blog-post-meta-item">{post.readTime || 5} min read</span>
            </div>
          </AnimatedSection>
          <AnimatedSection><h1 className="h-xl blog-post-title">{post.title}</h1></AnimatedSection>
          <AnimatedSection from="fade">
            <div className="blog-post-author">
              <div className="blog-post-author-avatar">S</div>
              <div>
                <div className="blog-post-author-name">Sahab Uddin Mintu</div>
                <div className="blog-post-author-role">WordPress & MERN Developer</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="container">
        <div className="blog-post-layout">
          <article>
            <AnimatedSection>
              <div className="blog-post-cover">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 800px"
                    className="blog-post-cover-img"
                  />
                ) : (post.category?.name || '??').slice(0, 2).toUpperCase()}
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div
                className="markdown-content blog-post-markdown"
                dangerouslySetInnerHTML={{ __html: sanitizeContent(post.content) }}
              />
            </AnimatedSection>
            <AnimatedSection className="blog-post-tags-section">
              <div className="blog-post-tags-label">Tags</div>
              <div className="d-flex flex-wrap gap-2">
                {(post.tags || []).map((t: any) => <span key={t._id} className="tag">{t.name}</span>)}
              </div>
            </AnimatedSection>
          </article>

          <aside className="blog-sidebar">
            <div className="blog-post-sidebar-sticky">
              <div className="blog-post-author-card">
                <div className="blog-post-author-card-avatar">S</div>
                <div className="blog-post-author-card-name">Sahab Uddin Mintu</div>
                <div className="blog-post-author-card-role">Developer</div>
                <p className="blog-post-author-card-bio">Writing about web dev, WordPress, freelancing and modern dev workflows.</p>
                <Link href="/about" className="blog-post-author-card-link">Read Full Bio →</Link>
              </div>
              <div className="blog-post-cta-card">
                <div className="blog-post-cta-title">Need a developer?</div>
                <p className="blog-post-cta-text">Let's build something great together.</p>
                <Link href="/contact" className="btn btn-outline blog-post-cta-btn">Start a Project →</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
