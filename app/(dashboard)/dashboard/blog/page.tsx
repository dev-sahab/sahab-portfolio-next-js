import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import '@/models/Category'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'
import DeleteButton from '@/components/dashboard/DeleteButton'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { BlogPost as IPost } from '@/types'
import '@/styles/pages/(dashboard)/dashboard/projects/projects.scss'

export default async function BlogPage() {
  await connectDB()
  const posts = await BlogPost.find().sort({ createdAt: -1 }).populate('category').lean() as unknown as IPost[]

  return (
    <div className="dashboard-page">
      <PageHeader title="Blog Posts" subtitle={`${posts.length} total`} action={{ label: 'New Post', href: '/dashboard/blog/new' }} />

      {posts.length === 0 ? (
        <EmptyState message="No blog posts yet." action={{ label: 'Write First Post', href: '/dashboard/blog/new' }} />
      ) : (
        <div className="crud-list">
          {posts.map((p) => (
            <div key={p._id} className="crud-row">
              <div className="crud-info">
                <div className="crud-title crud-title--tight">{p.title}</div>
                <div className="crud-meta">
                  <span className="crud-meta-blue">{p.category?.name || 'Uncategorized'}</span>
                  <span>·</span>
                  <span>{p.readTime || 5} min read</span>
                  <span>·</span>
                  <span className={`crud-status ${p.published ? 'published' : 'draft'}`}>{p.published ? 'Published' : 'Draft'}</span>
                  {p.featured && <><span>·</span><span className="crud-featured">Featured</span></>}
                </div>
              </div>
              <div className="crud-date">{p.createdAt ? formatDate(p.createdAt) : ''}</div>
              <div className="crud-actions">
                <Link href={`/dashboard/blog/${p._id}`} className="crud-edit-btn">Edit</Link>
                <DeleteButton endpoint={`/api/blog/${p._id}`} redirectTo="/dashboard/blog" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
