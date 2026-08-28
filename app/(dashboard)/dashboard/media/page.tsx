import PageHeader from '@/components/dashboard/PageHeader'
import MediaLibrary from '@/components/dashboard/MediaLibrary'
import { listMedia } from '@/lib/media'
import '@/styles/pages/(dashboard)/dashboard/media/page.scss'

export default async function MediaPage() {
  // Default, filterless first page only — every other filter/search/page
  // change still goes through MediaLibrary's existing client-side `load()`.
  const initialData = JSON.parse(JSON.stringify(await listMedia({ page: 1, limit: 50 })))

  return (
    <div className="media-page">
      <PageHeader title="Media Library" subtitle="All images uploaded across projects, blog posts and settings." />
      <MediaLibrary initialData={initialData} />
    </div>
  )
}
