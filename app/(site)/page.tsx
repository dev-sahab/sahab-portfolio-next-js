import Link from 'next/link'
import Image from 'next/image'
import { connection } from 'next/server'
import Marquee from '@/components/site/Marquee'
import AnimatedSection from '@/components/site/AnimatedSection'
import TestimonialSlider from '@/components/site/TestimonialSlider'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import '@/models/Tag'
import Testimonial from '@/models/Testimonial'
import SiteSettings from '@/models/SiteSettings'
import type { Project as IProject, BlogPost as IBlogPost, Testimonial as ITestimonial, SiteSettings as ISettings } from '@/types'

async function getData() {
  try {
    await connectDB()
    const [projects, posts, testimonials, settings] = await Promise.all([
      Project.find({ published: true }).sort({ featured: -1, createdAt: -1 }).limit(3).populate('category').populate('tags').lean(),
      BlogPost.find({ published: true }).sort({ createdAt: -1 }).limit(3).populate('category').lean(),
      Testimonial.find({ featured: true }).sort({ order: 1 }).lean(),
      SiteSettings.findOne().lean(),
    ])
    return { projects, posts, testimonials, settings }
  } catch {
    return { projects: [], posts: [], testimonials: [], settings: null }
  }
}

export default async function HomePage() {
  await connection()
  const { projects, posts, testimonials, settings } = await getData()
  const testimonialData = (testimonials as any[]).map((testimonial) => ({
    ...testimonial,
    _id: testimonial._id.toString(),
    createdAt: testimonial.createdAt?.toISOString(),
  })) as ITestimonial[]

  const s = settings as unknown as ISettings | null
  const stats = s?.stats?.length ? s.stats : [
    { value: '6+', label: 'Years Experience', target: 6, suffix: '+' },
    { value: '100+', label: 'Projects Shipped', target: 100, suffix: '+' },
    { value: '60+', label: 'Happy Clients', target: 60, suffix: '+' },
    { value: '5', label: 'CMS Platforms', target: 5, suffix: '' },
  ]

  return (
    <main>
      {/* ── HERO ── */}
      <section id="hero">
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.048) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div style={{ position: 'absolute', width: 720, height: 720, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,255,79,.07) 0%, transparent 60%)', right: -180, top: -180 }} />
        </div>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '128px var(--px) 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40 }}>
          <AnimatedSection from="fade" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid var(--border2)', borderRadius: 100, padding: '8px 16px', fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, display: 'block', animation: 'pulse 2s ease-in-out infinite' }} />
            {s?.availabilityText || 'Available for new projects'}
          </AnimatedSection>
          <AnimatedSection from="fade" style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', lineHeight: 1.9 }}>
              <strong style={{ color: 'var(--text2)', fontWeight: 400 }}>{s?.location || 'Sylhet, Bangladesh'}</strong><br />
              {s?.company || 'PIXELVEGA'}<br />
              {s?.tagline || 'WordPress & MERN Developer'}
            </p>
          </AnimatedSection>
        </div>

        <h1 className="hero-name">
          <AnimatedSection as="span" from="bottom" style={{ display: 'block' }}>Sahab</AnimatedSection>
          <AnimatedSection as="span" className="line2" from="bottom" delay={0.13}>Uddin.</AnimatedSection>
        </h1>

        <div className="hero-bottom-bar">
          <AnimatedSection from="bottom" delay={0.2}>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text2)', marginBottom: 26, maxWidth: 358 }}>
              {s?.bio?.slice(0, 160) || 'WordPress & MERN developer turning Figma into pixel-perfect, high-converting websites. Available for freelance worldwide.'}
            </p>
            <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap' }}>
              <Link href="/portfolio" className="btn btn-accent">View Work ↓</Link>
              <Link href="/contact" className="btn btn-outline">Start a Project</Link>
            </div>
          </AnimatedSection>

          <AnimatedSection from="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, justifySelf: 'center' }} aria-hidden="true">
            <div style={{ width: 1, height: 60, background: 'var(--border2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, left: 0, width: '100%', height: 30, background: 'var(--accent)', animation: 'scrollDrop 2s ease-in-out infinite' }} />
            </div>
            <span style={{ fontFamily: 'var(--f-m)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', writingMode: 'vertical-rl' }}>scroll</span>
          </AnimatedSection>

          <AnimatedSection from="bottom" delay={0.2} style={{ textAlign: 'right' }}>
            {stats.map((st) => (
              <p key={st.label} style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', lineHeight: 2.1 }}>
                {st.label} <span style={{ color: 'var(--text2)' }}>{st.value}</span>
              </p>
            ))}
          </AnimatedSection>
        </div>

        <style>{`
          @keyframes scrollDrop { 0%{top:-30px} 100%{top:60px} }
          @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.5)} 50%{opacity:.7;box-shadow:0 0 0 6px rgba(34,197,94,0)} }
        `}</style>
      </section>

      <Marquee />

      {/* ── STATS ── */}
      <div className="stats-bar">
        {stats.map((st) => (
          <div key={st.label} className="stat-cell">
            <div className="stat-num">{st.value}</div>
            <div className="stat-lbl">{st.label}</div>
          </div>
        ))}
      </div>

      {/* ── SERVICES ── */}
      <section className="section-pad" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <AnimatedSection><span className="s-label">What I Do</span></AnimatedSection>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, marginBottom: 56, flexWrap: 'wrap' }}>
            <AnimatedSection><h2 className="h-xl">My <span className="accent-word">Services</span></h2></AnimatedSection>
            <AnimatedSection from="fade"><Link href="/contact" style={{ fontFamily: 'var(--f-m)', fontSize: 12, color: 'var(--accent)' }}>Let's discuss →</Link></AnimatedSection>
          </div>
          <div className="services-grid">
            {(s?.services?.length ? s.services : [
              { icon: '⚡', title: 'WordPress Development', description: 'Custom themes, plugins, Elementor widgets, WooCommerce — built from your Figma file.', tags: ['WordPress', 'PHP', 'Elementor', 'WooCommerce'], order: 1 },
              { icon: '🎨', title: 'Webflow & Framer', description: 'CMS collections, animations, Memberstack gating and Make.com automations.', tags: ['Webflow', 'Framer', 'CMS', 'Memberstack'], order: 2 },
              { icon: '🚀', title: 'MERN Stack Apps', description: 'Full-stack apps with React, Node.js, MongoDB and Express. JWT auth, REST APIs.', tags: ['React', 'Node.js', 'MongoDB', 'REST API'], order: 3 },
            ]).sort((a, b) => a.order - b.order).map((svc, i) => (
              <AnimatedSection key={i} delay={i * 0.08} className="service-card">
                <div style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.12em', color: 'var(--muted)', marginBottom: 20 }}>0{i + 1}</div>
                <div style={{ fontSize: 29, marginBottom: 16 }}>{svc.icon}</div>
                <h3 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', marginBottom: 11 }}>{svc.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.72, color: 'var(--text2)', marginBottom: 20 }}>{svc.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {svc.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORK ── */}
      <section className="section-pad" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, marginBottom: 56, flexWrap: 'wrap' }}>
            <div>
              <AnimatedSection><span className="s-label">Selected Work</span></AnimatedSection>
              <AnimatedSection><h2 className="h-xl">Recent <span className="accent-word">Projects</span></h2></AnimatedSection>
            </div>
            <AnimatedSection><Link href="/portfolio" className="btn btn-outline">View All →</Link></AnimatedSection>
          </div>
          <div className="work-grid">
            {(projects as unknown as IProject[]).map((p, i) => (
              <AnimatedSection key={p._id} delay={i * 0.06}>
                <Link href={`/portfolio/${p.slug}`} className="project-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', position: 'relative', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 55, color: 'var(--border2)', letterSpacing: '-.04em' }}>
                    {p.coverImage ? (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (p.category?.name || '??').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.15em', color: 'var(--muted)', marginBottom: 9 }}>{String(i + 1).padStart(2, '0')} / {p.year}</div>
                    <h3 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 'clamp(18px,2.3vw,26px)', letterSpacing: '-.01em', marginBottom: 8, transition: 'color .3s', flex: 1 }}>{p.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.62, marginBottom: 20 }}>{p.excerpt}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {p.tags.slice(0, 2).map((t: any) => <span key={t._id} className="tag">{t.name}</span>)}
                      </div>
                      <div style={{ width: 38, height: 38, border: '1px solid var(--border2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>↗</div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="section-pad" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <AnimatedSection><span className="s-label">Client Stories</span></AnimatedSection>
            <AnimatedSection><h2 className="h-xl">What <span className="accent-word">clients</span> say</h2></AnimatedSection>
            <TestimonialSlider testimonials={testimonialData} />
          </div>
        </section>
      )}

      {/* ── BLOG ── */}
      {posts.length > 0 && (
        <section className="section-pad" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, marginBottom: 56, flexWrap: 'wrap' }}>
              <div>
                <AnimatedSection><span className="s-label">Latest Writing</span></AnimatedSection>
                <AnimatedSection><h2 className="h-xl">From the <span className="accent-word">Blog</span></h2></AnimatedSection>
              </div>
              <AnimatedSection><Link href="/blog" className="btn btn-outline">All Articles →</Link></AnimatedSection>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2 }}>
              {(posts as unknown as IBlogPost[]).map((post, i) => (
                <AnimatedSection key={post._id} delay={i * 0.06}>
                  <Link href={`/blog/${post.slug}`} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform .38s var(--ease)' }}>
                    <div style={{ width: '100%', aspectRatio: '16/9', position: 'relative', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontSize: 42, fontWeight: 800, color: 'var(--border2)' }}>
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (post.category?.name || '??').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 11, fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        <span style={{ color: 'var(--accent)' }}>{post.category?.name || 'Uncategorized'}</span>
                        <span>·</span>
                        <span>{post.readTime || 5} min read</span>
                      </div>
                      <h3 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 18, letterSpacing: '-.01em', marginBottom: 7, flex: 1 }}>{post.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.62, marginBottom: 16 }}>{post.excerpt}</p>
                      <span style={{ fontFamily: 'var(--f-m)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>Read →</span>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <AnimatedSection style={{ textAlign: 'center' }}>
            <span className="s-label" style={{ justifyContent: 'center' }}>Let's Collaborate</span>
            <h2 className="cta-title">Have an <span className="accent-word">idea?</span><br />Let's build it.</h2>
            <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 460, margin: '0 auto 44px', lineHeight: 1.7 }}>
              Open for freelance projects, consulting & full-time roles. Reply within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/get-quote" className="btn btn-accent">Get a Free Quote →</Link>
              <Link href="/contact" className="btn btn-outline">Start a Project</Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}
