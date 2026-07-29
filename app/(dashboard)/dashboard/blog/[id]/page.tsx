import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import ContentForm from '@/components/dashboard/ContentForm'
import DeleteButton from '@/components/dashboard/DeleteButton'
import { notFound } from 'next/navigation'

const FIELDS = [
  { name: 'title',      label: 'Post Title', required: true },
  { name: 'slug',       label: 'Slug' },
  { name: 'category',  label: 'Category', required: true },
  { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-blog' },
  { name: 'excerpt',    label: 'Excerpt', type: 'textarea' as const },
  { name: 'content',   label: 'Full Content (Markdown)', type: 'textarea' as const },
  { name: 'tags',      label: 'Tags', type: 'tags' as const },
  { name: 'featured',  label: 'Featured?', type: 'checkbox' as const },
  { name: 'published', label: 'Published?', type: 'checkbox' as const },
]

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const post = await BlogPost.findById(id).lean()
  if (!post) notFound()
  const p = post as any
  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em' }}>Edit Post</h1>
        <DeleteButton endpoint={`/api/blog/${id}`} redirectTo="/dashboard/blog" />
      </div>
      <ContentForm
        title="Post Details"
        endpoint={`/api/blog/${id}`}
        method="PUT"
        fields={FIELDS}
        defaults={{ ...p, _id: undefined, tags: p.tags || [] }}
        redirectTo="/dashboard/blog"
      />
    </div>
  )
}
