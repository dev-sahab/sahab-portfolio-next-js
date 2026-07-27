import ContentForm from '@/components/dashboard/ContentForm'

const FIELDS = [
  { name: 'title',       label: 'Project Title',              required: true },
  { name: 'slug',        label: 'Slug (auto if blank)' },
  { name: 'category',   label: 'Category',  type: 'select' as const, required: true, options: ['wordpress','woocommerce','webflow','mern','framer','other'] },
  { name: 'year',        label: 'Year',      type: 'number' as const, required: true },
  { name: 'client',      label: 'Client Name' },
  { name: 'duration',    label: 'Duration  (e.g. "3 weeks")' },
  { name: 'liveUrl',     label: 'Live URL',  type: 'url' as const },
  { name: 'githubUrl',   label: 'GitHub URL', type: 'url' as const },
  { name: 'coverImage',  label: 'Cover Image', type: 'image' as const, imageFolder: 'sahab-projects' },
  { name: 'excerpt',     label: 'Short Excerpt',           type: 'textarea' as const },
  { name: 'content',     label: 'Full Case Study (Markdown)', type: 'textarea' as const },
  { name: 'tags',        label: 'Tags (press Enter)',  type: 'tags' as const },
  { name: 'stack',       label: 'Tech Stack (press Enter)', type: 'tags' as const },
  { name: 'featured',   label: 'Featured?',  type: 'checkbox' as const },
  { name: 'published',  label: 'Published?', type: 'checkbox' as const },
]

export default function NewProjectPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--f-d)', color: '#f0ede6', letterSpacing: '-.02em', marginBottom: 24 }}>New Project</h1>
      <ContentForm title="Project Details" endpoint="/api/projects" method="POST" fields={FIELDS}
        defaults={{ published: true, featured: false, year: new Date().getFullYear() }}
        redirectTo="/dashboard/projects" />
    </div>
  )
}
