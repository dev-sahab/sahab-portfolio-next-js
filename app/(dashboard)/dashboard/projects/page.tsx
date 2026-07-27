import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Image from 'next/image'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'
import DeleteButton from '@/components/dashboard/DeleteButton'
import Link from 'next/link'
import type { Project as IProject } from '@/types'

export default async function ProjectsPage() {
  await connectDB()
  const projects = await Project.find().sort({ createdAt: -1 }).lean() as unknown as IProject[]

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Projects" subtitle={`${projects.length} total`} action={{ label: 'New Project', href: '/dashboard/projects/new' }} />

      {projects.length === 0 ? (
        <EmptyState message="No projects yet." action={{ label: 'Add First Project', href: '/dashboard/projects/new' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {projects.map((p) => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ width: 48, height: 48, background: '#222', borderRadius: 6, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-d)', fontWeight: 800, fontSize: 14, color: '#b8ff4f', flexShrink: 0 }}>
                {p.coverImage ? (
                  <Image src={p.coverImage} alt={p.title} fill sizes="48px" style={{ objectFit: 'cover' }} />
                ) : p.category.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f0ede6', marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#555', display: 'flex', gap: 12 }}>
                  <span>{p.category}</span>
                  <span>·</span>
                  <span>{p.year}</span>
                  <span>·</span>
                  <span style={{ color: p.published ? '#22c55e' : '#f59e0b' }}>{p.published ? 'Published' : 'Draft'}</span>
                  {p.featured && <><span>·</span><span style={{ color: '#b8ff4f' }}>Featured</span></>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/dashboard/projects/${p._id}`} style={{ padding: '7px 14px', background: '#222', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)', textDecoration: 'none' }}>Edit</Link>
                <DeleteButton endpoint={`/api/projects/${p._id}`} redirectTo="/dashboard/projects" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
