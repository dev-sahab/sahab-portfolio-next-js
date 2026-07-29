import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import ContentForm from '@/components/dashboard/ContentForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { notFound } from 'next/navigation'

const FIELDS = [
  { name: 'title',      label: 'Project Title', required: true },
  { name: 'slug',       label: 'Slug' },
  { name: 'category',  label: 'Category', type: 'select' as const, required: true,
    options: ['wordpress','woocommerce','webflow','mern','framer','other'] },
  { name: 'year',       label: 'Year', type: 'number' as const, required: true },
  { name: 'client',     label: 'Client Name' },
  { name: 'duration',   label: 'Duration' },
  { name: 'liveUrl',    label: 'Live URL',   type: 'url' as const },
  { name: 'githubUrl',  label: 'GitHub URL', type: 'url' as const },
  { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-projects' },
  { name: 'excerpt',    label: 'Short Excerpt',           type: 'textarea' as const },
  { name: 'content',    label: 'Full Case Study (Markdown)', type: 'textarea' as const },
  { name: 'tags',       label: 'Tags',       type: 'tags' as const },
  { name: 'stack',      label: 'Tech Stack', type: 'tags' as const },
  { name: 'featured',  label: 'Featured?',  type: 'checkbox' as const },
  { name: 'published', label: 'Published?', type: 'checkbox' as const },
]

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const project = await Project.findById(id).lean()
  if (!project) notFound()
  const p = project as any
  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em' }}>Edit Project</h1>
        <DeleteButton endpoint={`/api/projects/${id}`} redirectTo="/dashboard/projects" />
      </div>
      <ContentForm
        title="Project Details"
        endpoint={`/api/projects/${id}`}
        method="PUT"
        fields={FIELDS}
        defaults={{ ...p, _id: undefined, tags: p.tags || [], stack: p.stack || [] }}
        redirectTo="/dashboard/projects"
      />
    </div>
  )
}
