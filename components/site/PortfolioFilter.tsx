'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Project, Category } from '@/types'
import '@/styles/components/site/PortfolioFilter.scss'

export default function PortfolioFilter({ projects, categories }: { projects: Project[]; categories: Category[] }) {
  const [active,    setActive]    = useState('*')
  const [animating, setAnimating] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const filters = [{ label: 'All', value: '*' }, ...categories.map(c => ({ label: c.name, value: c.slug }))]
  const filtered = active === '*' ? projects : projects.filter(p => p.category?.slug === active)

  const handleFilter = async (val: string) => {
    if (val === active || animating) return
    setAnimating(true)
    const { gsap } = await import('gsap')
    const items = gridRef.current?.querySelectorAll('.pf-item') || []
    await gsap.to(items, { opacity: 0, scale: 0.94, duration: 0.18, ease: 'power2.in' })
    setActive(val)
    setAnimating(false)
    setTimeout(async () => {
      const newItems = gridRef.current?.querySelectorAll('.pf-item') || []
      gsap.fromTo(newItems,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out', stagger: 0.04 }
      )
    }, 50)
  }

  return (
    <>
      {/* Filter bar */}
      <div className="portfolio-filter-wrap">
        {filters.map(f => (
          <button key={f.value} className={`filter-btn${active === f.value ? ' active' : ''}`} onClick={() => handleFilter(f.value)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div ref={gridRef} className="portfolio-grid">
        {filtered.map(p => (
          <Link key={p._id} href={`/portfolio/${p.slug}`} className="pf-item">
            {/* Cover image if set, else fallback */}
            {p.coverImage ? (
              <Image
                src={p.coverImage} alt={p.title}
                fill className="pf-cover-img"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="pf-cover-fallback">
                {(p.category?.name || '??').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="pf-overlay">
              <div className="pf-overlay-meta">
                {p.category?.name || 'Uncategorized'} · {p.year}
              </div>
              <h3 className="pf-overlay-title">{p.title}</h3>
              <p className="pf-overlay-desc">{p.excerpt}</p>
              <span className="btn btn-accent pf-overlay-cta">Case Study →</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
