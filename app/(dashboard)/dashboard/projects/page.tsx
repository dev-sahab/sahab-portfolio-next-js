import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import '@/models/Category'
import Image from 'next/image'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'
import DeleteButton from '@/components/dashboard/DeleteButton'
import Link from 'next/link'
import type { Project as IProject } from '@/types'
import './projects.scss'

export default async function ProjectsPage() {
  await connectDB()
  const projects = await Project.find().sort({ createdAt: -1 }).populate('category').lean() as unknown as IProject[]

  return (
    <div className="dashboard-page">
      <PageHeader title="Projects" subtitle={`${projects.length} total`} action={{ label: 'New Project', href: '/dashboard/projects/new' }} />

      {projects.length === 0 ? (
        <EmptyState message="No projects yet." action={{ label: 'Add First Project', href: '/dashboard/projects/new' }} />
      ) : (
        <div className="crud-list">
          {projects.map((p) => (
            <div key={p._id} className="crud-row">
              <div className="crud-thumb">
                {p.coverImage ? (
                  <Image src={p.coverImage} alt={p.title} fill sizes="48px" className="crud-thumb-img" />
                ) : (p.category?.name || '??').slice(0, 2).toUpperCase()}
              </div>
              <div className="crud-info">
                <div className="crud-title">{p.title}</div>
                <div className="crud-meta">
                  <span>{p.category?.name || 'Uncategorized'}</span>
                  <span>·</span>
                  <span>{p.year}</span>
                  <span>·</span>
                  <span className={`crud-status ${p.published ? 'published' : 'draft'}`}>{p.published ? 'Published' : 'Draft'}</span>
                  {p.featured && <><span>·</span><span className="crud-featured">Featured</span></>}
                </div>
              </div>
              <div className="crud-actions">
                <Link href={`/dashboard/projects/${p._id}`} className="crud-edit-btn">Edit</Link>
                <DeleteButton endpoint={`/api/projects/${p._id}`} redirectTo="/dashboard/projects" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
