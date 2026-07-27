import connectDB from '@/lib/mongodb'
import BlogPost from '@/models/BlogPost'
import PageHeader from '@/components/dashboard/PageHeader'
import EmptyState from '@/components/dashboard/EmptyState'
import DeleteButton from '@/components/dashboard/DeleteButton'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { BlogPost as IPost } from '@/types'

export default async function BlogPage() {
  await connectDB()
  const posts = await BlogPost.find().sort({ createdAt: -1 }).lean() as unknown as IPost[]

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Blog Posts" subtitle={`${posts.length} total`} action={{ label: 'New Post', href: '/dashboard/blog/new' }} />

      {posts.length === 0 ? (
        <EmptyState message="No blog posts yet." action={{ label: 'Write First Post', href: '/dashboard/blog/new' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.map((p) => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f0ede6', marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#555', display: 'flex', gap: 12 }}>
                  <span style={{ color: '#60a5fa' }}>{p.category}</span>
                  <span>·</span>
                  <span>{p.readTime || 5} min read</span>
                  <span>·</span>
                  <span style={{ color: p.published ? '#22c55e' : '#f59e0b' }}>{p.published ? 'Published' : 'Draft'}</span>
                  {p.featured && <><span>·</span><span style={{ color: '#b8ff4f' }}>Featured</span></>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#555', flexShrink: 0 }}>{p.createdAt ? formatDate(p.createdAt) : ''}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/dashboard/blog/${p._id}`} style={{ padding: '7px 14px', background: '#222', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, color: '#9a9a9a', fontFamily: 'var(--f-m)', textDecoration: 'none' }}>Edit</Link>
                <DeleteButton endpoint={`/api/blog/${p._id}`} redirectTo="/dashboard/blog" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
