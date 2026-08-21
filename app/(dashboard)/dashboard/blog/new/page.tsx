import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import ContentForm from '@/components/dashboard/ContentForm'
import '@/styles/pages/(dashboard)/dashboard/projects/projects.scss'

export default async function NewBlogPage() {
  await connectDB()
  const [categories, tags] = await Promise.all([
    Category.find({ type: 'blog' }).sort({ name: 1 }).lean(),
    Tag.find({ type: 'blog' }).sort({ name: 1 }).lean(),
  ])
  const categoriesPlain = (categories as any[]).map(c => ({ _id: String(c._id), name: c.name, parent: c.parent ? String(c.parent) : null }))
  const tagNames = (tags as any[]).map(t => t.name)

  const FIELDS = [
    { name: 'title',      label: 'Post Title',  required: true },
    { name: 'slug',       label: 'Slug (auto-generated if blank)' },
    { name: 'excerpt',    label: 'Excerpt (short summary shown on blog list)', type: 'textarea' as const },
    { name: 'content',   label: 'Full Content (Markdown supported)', type: 'richtext' as const },
    { name: 'featured',  label: 'Mark as Featured?', type: 'checkbox' as const, section: 'side' as const },
    { name: 'published', label: 'Publish immediately?', type: 'checkbox' as const, section: 'side' as const },
    { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-blog', section: 'side' as const, sideGroup: 'Featured Image' },
    { name: 'category',  label: 'Category', type: 'category' as const, required: true,
      categories: categoriesPlain, taxonomyType: 'blog' as const, section: 'side' as const, sideGroup: 'Category' },
    { name: 'tags',      label: 'Tags (press Enter to add)', type: 'tags' as const, suggestions: tagNames, section: 'side' as const, sideGroup: 'Tags' },
  ]

  return (
    <div className="dashboard-page-wide">
      <h1 className="crud-form-title crud-form-title--standalone">
        New Blog Post
      </h1>
      <ContentForm
        title="Post Details"
        endpoint="/api/blog"
        method="POST"
        fields={FIELDS}
        defaults={{ published: false, featured: false }}
        redirectTo="/dashboard/blog"
      />
    </div>
  )
}
