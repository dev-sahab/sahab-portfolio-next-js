import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import Project from '@/models/Project'
import ContentForm from '@/components/dashboard/ContentForm'

export default async function NewProjectPage() {
  await connectDB()
  const [categories, tags, stack] = await Promise.all([
    Category.find({ type: 'project' }).sort({ name: 1 }).lean(),
    Tag.find({ type: 'project' }).sort({ name: 1 }).lean(),
    Project.distinct('stack'),
  ])
  const categoriesPlain = (categories as any[]).map(c => ({ _id: String(c._id), name: c.name, parent: c.parent ? String(c.parent) : null }))
  const tagNames = (tags as any[]).map(t => t.name)

  const FIELDS = [
    { name: 'title',      label: 'Project Title',               required: true },
    { name: 'slug',       label: 'Slug (auto-generated if blank)' },
    { name: 'year',       label: 'Year',     type: 'number' as const, required: true },
    { name: 'client',     label: 'Client Name' },
    { name: 'duration',   label: 'Duration (e.g. "3 weeks")' },
    { name: 'liveUrl',    label: 'Live URL',    type: 'url' as const },
    { name: 'githubUrl',  label: 'GitHub URL',  type: 'url' as const },
    { name: 'excerpt',    label: 'Short Excerpt (shown on cards)', type: 'textarea' as const },
    { name: 'content',    label: 'Full Case Study Content (Markdown)', type: 'richtext' as const },
    { name: 'featured',  label: 'Mark as Featured?',  type: 'checkbox' as const, section: 'side' as const },
    { name: 'published', label: 'Publish immediately?', type: 'checkbox' as const, section: 'side' as const },
    { name: 'noIndex',   label: 'Hide from search engines (noindex)', type: 'checkbox' as const, section: 'side' as const },
    { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-projects', section: 'side' as const, sideGroup: 'Featured Image' },
    { name: 'gallery',    label: 'Gallery Images', type: 'gallery' as const, imageFolder: 'sahab-projects', section: 'side' as const, sideGroup: 'Gallery' },
    { name: 'category',  label: 'Category', type: 'category' as const, required: true,
      categories: categoriesPlain, taxonomyType: 'project' as const, section: 'side' as const, sideGroup: 'Category' },
    { name: 'tags',       label: 'Tags (press Enter to add)',    type: 'tags' as const, suggestions: tagNames, section: 'side' as const, sideGroup: 'Tags' },
    { name: 'stack',      label: 'Tech Stack (press Enter)',     type: 'tags' as const, suggestions: stack as string[], section: 'side' as const, sideGroup: 'Tech Stack' },
  ]

  return (
    <div style={{ padding: 32, maxWidth: 1280 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em', marginBottom: 24 }}>
        New Project
      </h1>
      <ContentForm
        title="Project Details"
        endpoint="/api/projects"
        method="POST"
        fields={FIELDS}
        defaults={{ published: true, featured: false, noIndex: false, year: new Date().getFullYear() }}
        redirectTo="/dashboard/projects"
      />
    </div>
  )
}
