'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/types'

const FILTERS = [
  { label: 'All',        value: '*' },
  { label: 'WordPress',  value: 'wordpress' },
  { label: 'WooCommerce',value: 'woocommerce' },
  { label: 'Webflow',    value: 'webflow' },
  { label: 'MERN',       value: 'mern' },
  { label: 'Framer',     value: 'framer' },
]

export default function PortfolioFilter({ projects }: { projects: Project[] }) {
  const [active,    setActive]    = useState('*')
  const [animating, setAnimating] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = active === '*' ? projects : projects.filter(p => p.category === active)

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
      <div className="portfolio-filter-wrap" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '26px 0', borderBottom: '1px solid var(--border)' }}>
        {FILTERS.map(f => (
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
                fill style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 42, color: 'var(--border2)', letterSpacing: '-.04em' }}>
                {p.category.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="pf-overlay">
              <div style={{ fontFamily: 'var(--f-m)', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 7 }}>
                {p.category} · {p.year}
              </div>
              <h3 style={{ fontFamily: 'var(--f-d)', fontWeight: 700, fontSize: 19, letterSpacing: '-.01em', color: 'var(--text)', marginBottom: 7 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 14 }}>{p.excerpt}</p>
              <span className="btn btn-accent" style={{ padding: '8px 16px', fontSize: 10 }}>Case Study →</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
