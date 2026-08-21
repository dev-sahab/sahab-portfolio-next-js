import PageHeader from '@/components/dashboard/PageHeader'
import MediaLibrary from '@/components/dashboard/MediaLibrary'
import '@/styles/pages/(dashboard)/dashboard/media/page.scss'

export default function MediaPage() {
  return (
    <div className="media-page">
      <PageHeader title="Media Library" subtitle="All images uploaded across projects, blog posts and settings." />
      <MediaLibrary />
    </div>
  )
}
