import type { Metadata } from 'next'
import { connection } from 'next/server'
import Link from 'next/link'
import Image from 'next/image'
import AnimatedSection from '@/components/site/AnimatedSection'
import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import '@/models/Tag'
import { formatDate } from '@/lib/utils'
import type { BlogPost as IPost } from '@/types'

export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  await connection()
  let posts: IPost[] = []
  try { await connectDB(); posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 }).populate('category').lean() as unknown as IPost[] } catch {}

  return (
    <main>
      <section className="page-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 17, display: 'flex', gap: 8 }}>
              <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link><span>/</span><span>Blog</span>
            </div>
          </AnimatedSection>
          <AnimatedSection><h1 className="h-xl">The <span className="accent-word">Blog</span></h1></AnimatedSection>
          <AnimatedSection from="fade"><p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 540, marginTop: 17, lineHeight: 1.72 }}>Thoughts on WordPress, web development, freelancing and the modern web.</p></AnimatedSection>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
              <p>No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {posts.map((post, i) => (
                <AnimatedSection key={post._id} delay={i * 0.04}>
                  <Link href={`/blog/${post.slug}`} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', background: 'var(--surface)', borderRadius: 'var(--r)', overflow: 'hidden', transition: 'transform .38s var(--ease)' }}>
                    <div style={{ position: 'relative', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontSize: 36, fontWeight: 800, color: 'var(--border2)', aspectRatio: '1/1' }}>
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="200px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (post.category?.name || '??').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ padding: '24px 26px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 9, fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        <span style={{ color: 'var(--accent)' }}>{post.category?.name || 'Uncategorized'}</span>
                        <span>·</span>
                        <span>{post.readTime || 5} min read</span>
                        <span>·</span>
                        <span>{post.createdAt ? formatDate(post.createdAt) : ''}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', marginBottom: 7, transition: 'color .3s', flex: 1 }}>{post.title}</div>
                      <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.62, marginBottom: 13 }}>{post.excerpt}</p>
                      <span style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Read Article →</span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
