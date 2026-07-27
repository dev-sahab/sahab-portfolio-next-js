import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import AnimatedSection from '@/components/site/AnimatedSection'
import { formatDate } from '@/lib/utils'
import type { BlogPost as IPost } from '@/types'

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
  try { await connectDB(); post = await BlogPost.findOne({ slug, published: true }).lean() as unknown as IPost } catch {}
  if (!post) notFound()

  return (
    <main>
      <section className="page-hero" style={{ paddingBottom: 40 }}>
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 18, display: 'flex', gap: 8 }}>
              <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link><span>/</span>
              <Link href="/blog" style={{ color: 'var(--muted)' }}>Blog</Link><span>/</span>
              <span>{post.category}</span>
            </div>
          </AnimatedSection>
          <AnimatedSection>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
              <span className="tag green">{post.category}</span>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{post.createdAt ? formatDate(post.createdAt) : ''}</span>
              <span style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{post.readTime || 5} min read</span>
            </div>
          </AnimatedSection>
          <AnimatedSection><h1 className="h-xl" style={{ maxWidth: 860 }}>{post.title}</h1></AnimatedSection>
          <AnimatedSection from="fade">
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 28 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 17, color: 'var(--accent)' }}>S</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Sahab Uddin Mintu</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>WordPress & MERN Developer</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 56, padding: '68px 0' }}>
          <article>
            <AnimatedSection>
              <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--surface), var(--surface2))', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 44, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 60, color: 'var(--border2)' }}>
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 800px"
                    style={{ objectFit: 'cover' }}
                  />
                ) : post.category.slice(0, 2).toUpperCase()}
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div style={{ fontSize: 16, lineHeight: 1.88, color: 'var(--text2)', whiteSpace: 'pre-wrap' }}>{post.content}</div>
            </AnimatedSection>
            <AnimatedSection style={{ marginTop: 44, paddingTop: 30, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Tags</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </AnimatedSection>
          </article>

          <aside>
            <div style={{ position: 'sticky', top: 110 }}>
              <div style={{ background: 'var(--surface)', padding: 26, borderRadius: 'var(--r)', marginBottom: 24 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 22, color: 'var(--accent)', marginBottom: 13 }}>S</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Sahab Uddin Mintu</div>
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 13 }}>Developer</div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 18 }}>Writing about web dev, WordPress, freelancing and modern dev workflows.</p>
                <Link href="/about" style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Read Full Bio →</Link>
              </div>
              <div style={{ background: 'var(--accent)', color: 'var(--bg)', padding: 26, borderRadius: 'var(--r)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 19, marginBottom: 9 }}>Need a developer?</div>
                <p style={{ fontSize: 13, marginBottom: 18, lineHeight: 1.6, opacity: .85 }}>Let's build something great together.</p>
                <Link href="/contact" className="btn btn-outline" style={{ background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--bg)', width: '100%', justifyContent: 'center' }}>Start a Project →</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
