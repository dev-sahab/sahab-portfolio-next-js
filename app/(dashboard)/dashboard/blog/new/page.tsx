import ContentForm from '@/components/dashboard/ContentForm'

const FIELDS = [
  { name: 'title',      label: 'Post Title',  required: true },
  { name: 'slug',       label: 'Slug (auto-generated if blank)' },
  { name: 'category',  label: 'Category',    required: true, placeholder: 'e.g. WordPress, Webflow, Freelance' },
  { name: 'coverImage', label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-blog' },
  { name: 'excerpt',    label: 'Excerpt (short summary shown on blog list)', type: 'textarea' as const },
  { name: 'content',   label: 'Full Content (Markdown supported)', type: 'textarea' as const },
  { name: 'tags',      label: 'Tags (press Enter to add)', type: 'tags' as const },
  { name: 'featured',  label: 'Mark as Featured?', type: 'checkbox' as const },
  { name: 'published', label: 'Publish immediately?', type: 'checkbox' as const },
]

export default function NewBlogPage() {
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
