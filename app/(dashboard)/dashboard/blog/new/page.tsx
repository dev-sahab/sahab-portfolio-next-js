import ContentForm from '@/components/dashboard/ContentForm'

const FIELDS = [
  { name: 'title',      label: 'Title',      required: true },
  { name: 'slug',       label: 'Slug (auto if blank)' },
  { name: 'category',  label: 'Category',   required: true },
  { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-blog' },
  { name: 'excerpt',    label: 'Excerpt',    type: 'textarea' as const },
  { name: 'content',   label: 'Content (Markdown)', type: 'textarea' as const },
  { name: 'tags',      label: 'Tags (press Enter)', type: 'tags' as const },
  { name: 'featured',  label: 'Featured?',  type: 'checkbox' as const },
  { name: 'published', label: 'Published?', type: 'checkbox' as const },
]

export default function NewBlogPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em', marginBottom: 24 }}>New Blog Post</h1>
      <ContentForm title="Post Details" endpoint="/api/blog" method="POST" fields={FIELDS}
        defaults={{ published: false, featured: false }}
        redirectTo="/dashboard/blog" />
    </div>
  )
}
