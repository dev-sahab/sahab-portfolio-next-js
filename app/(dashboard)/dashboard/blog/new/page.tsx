import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import ContentForm from '@/components/dashboard/ContentForm'

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
    { name: 'category',  label: 'Category', type: 'category' as const, required: true,
      categories: categoriesPlain, taxonomyType: 'blog' as const },
    { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-blog' },
    { name: 'excerpt',    label: 'Excerpt (short summary shown on blog list)', type: 'textarea' as const },
    { name: 'content',   label: 'Full Content (Markdown supported)', type: 'textarea' as const },
    { name: 'tags',      label: 'Tags (press Enter to add)', type: 'tags' as const, suggestions: tagNames },
    { name: 'featured',  label: 'Mark as Featured?', type: 'checkbox' as const },
    { name: 'published', label: 'Publish immediately?', type: 'checkbox' as const },
  ]

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em', marginBottom: 24 }}>
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
