import type { Metadata } from 'next'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Category from '@/models/Category'
import '@/models/Tag'
import PortfolioFilter from '@/components/site/PortfolioFilter'
import AnimatedSection from '@/components/site/AnimatedSection'
import Link from 'next/link'
import type { Project as IProject, Category as ICategory } from '@/types'

export const metadata: Metadata = { title: 'Portfolio' }

export default async function PortfolioPage() {
  let projects: IProject[] = []
  let categories: ICategory[] = []
  try {
    await connectDB()
    ;[projects, categories] = await Promise.all([
      Project.find({ published: true })
        .sort({ featured: -1, createdAt: -1 }).populate('category').populate('tags').lean() as unknown as IProject[],
      Category.find({ type: 'project' }).sort({ name: 1 }).lean() as unknown as ICategory[],
    ])
  } catch {}

  return (
    <main>
      <section className="page-hero">
        <div className="ph-dots" aria-hidden="true" />
        <div className="container">
          <AnimatedSection>
            <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 17, display: 'flex', gap: 8 }}>
              <Link href="/" style={{ color: 'var(--muted)' }}>Home</Link>
              <span style={{ color: 'var(--border2)' }}>/</span>
              <span>Portfolio</span>
            </div>
          </AnimatedSection>
          <AnimatedSection><h1 className="h-xl">Selected <span className="accent-word">Work</span></h1></AnimatedSection>
          <AnimatedSection from="fade">
            <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 540, marginTop: 17, lineHeight: 1.72 }}>
              A curated collection — WordPress, Webflow, MERN and more.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="container">
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--muted)' }}>
            <p style={{ fontSize: 16 }}>Projects coming soon. Check back later!</p>
          </div>
        ) : (
          <PortfolioFilter projects={projects} categories={categories} />
        )}
      </div>

      <section style={{ padding: '80px 0', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--surface)', marginTop: 60 }}>
        <div className="container">
          <AnimatedSection>
            <span className="s-label" style={{ justifyContent: 'center' }}>Your project next</span>
            <h2 className="h-xl">Got an <span className="accent-word">idea?</span></h2>
            <p style={{ color: 'var(--text2)', maxWidth: 420, margin: '18px auto 36px', fontSize: 16, lineHeight: 1.7 }}>
              Let's turn your vision into a live, high-performance product.
            </p>
            <Link href="/contact" className="btn btn-accent">Start a Project →</Link>
          </AnimatedSection>
        </div>
      </section>
    </main>
  )
}
