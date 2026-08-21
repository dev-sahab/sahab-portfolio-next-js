import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import ContentForm from '@/components/dashboard/ContentForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { notFound } from 'next/navigation'
import '@/styles/pages/(dashboard)/dashboard/projects/projects.scss'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const [post, categories, tags] = await Promise.all([
    BlogPost.findById(id).populate('category').populate('tags').lean(),
    Category.find({ type: 'blog' }).sort({ name: 1 }).lean(),
    Tag.find({ type: 'blog' }).sort({ name: 1 }).lean(),
  ])
  if (!post) notFound()
  const p = post as any
  const categoriesPlain = (categories as any[]).map(c => ({ _id: String(c._id), name: c.name, parent: c.parent ? String(c.parent) : null }))
  const tagNames = (tags as any[]).map(t => t.name)

  const FIELDS = [
    { name: 'title',      label: 'Post Title', required: true },
    { name: 'slug',       label: 'Slug' },
    { name: 'excerpt',    label: 'Excerpt', type: 'textarea' as const },
    { name: 'content',   label: 'Full Content (Markdown)', type: 'richtext' as const },
    { name: 'featured',  label: 'Featured?', type: 'checkbox' as const, section: 'side' as const },
    { name: 'published', label: 'Published?', type: 'checkbox' as const, section: 'side' as const },
    { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-blog', section: 'side' as const, sideGroup: 'Featured Image' },
    { name: 'category',  label: 'Category', type: 'category' as const, required: true,
      categories: categoriesPlain, taxonomyType: 'blog' as const, section: 'side' as const, sideGroup: 'Category' },
    { name: 'tags',      label: 'Tags', type: 'tags' as const, suggestions: tagNames, section: 'side' as const, sideGroup: 'Tags' },
  ]

  return (
    <div className="dashboard-page-wide">
      <div className="crud-form-header">
        <h1 className="crud-form-title">Edit Post</h1>
        <DeleteButton endpoint={`/api/blog/${id}`} redirectTo="/dashboard/blog" />
      </div>
      <ContentForm
        title="Post Details"
        endpoint={`/api/blog/${id}`}
        method="PUT"
        fields={FIELDS}
        defaults={{
          ...p,
          _id: undefined,
          category: p.category?._id ? String(p.category._id) : '',
          tags: (p.tags || []).map((t: any) => t.name),
        }}
        redirectTo="/dashboard/blog"
      />
    </div>
  )
}
