import PageHeader from '@/components/dashboard/PageHeader'
import MediaLibrary from '@/components/dashboard/MediaLibrary'

export default function MediaPage() {
  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Media Library" subtitle="All images uploaded across projects, blog posts and settings." />
      <MediaLibrary />
    </div>
  )
}
