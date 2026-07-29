import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import ContentForm from '@/components/dashboard/ContentForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { notFound } from 'next/navigation'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const [project, categories, tags, stack] = await Promise.all([
    Project.findById(id).populate('category').populate('tags').lean(),
    Category.find({ type: 'project' }).sort({ name: 1 }).lean(),
    Tag.find({ type: 'project' }).sort({ name: 1 }).lean(),
    Project.distinct('stack'),
  ])
  if (!project) notFound()
  const p = project as any
  const categoriesPlain = (categories as any[]).map(c => ({ _id: String(c._id), name: c.name, parent: c.parent ? String(c.parent) : null }))
  const tagNames = (tags as any[]).map(t => t.name)

  const FIELDS = [
    { name: 'title',      label: 'Project Title', required: true },
    { name: 'slug',       label: 'Slug' },
    { name: 'category',  label: 'Category', type: 'category' as const, required: true,
      categories: categoriesPlain, taxonomyType: 'project' as const },
    { name: 'year',       label: 'Year', type: 'number' as const, required: true },
    { name: 'client',     label: 'Client Name' },
    { name: 'duration',   label: 'Duration' },
    { name: 'liveUrl',    label: 'Live URL',   type: 'url' as const },
    { name: 'githubUrl',  label: 'GitHub URL', type: 'url' as const },
    { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-projects' },
    { name: 'excerpt',    label: 'Short Excerpt',           type: 'textarea' as const },
    { name: 'content',    label: 'Full Case Study (Markdown)', type: 'textarea' as const },
    { name: 'tags',       label: 'Tags',       type: 'tags' as const, suggestions: tagNames },
    { name: 'stack',      label: 'Tech Stack', type: 'tags' as const, suggestions: stack as string[] },
    { name: 'featured',  label: 'Featured?',  type: 'checkbox' as const },
    { name: 'published', label: 'Published?', type: 'checkbox' as const },
  ]

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
        defaults={{
          ...p,
          _id: undefined,
          category: p.category?._id ? String(p.category._id) : '',
          tags: (p.tags || []).map((t: any) => t.name),
          stack: p.stack || [],
        }}
        redirectTo="/dashboard/projects"
      />
    </div>
  )
}
