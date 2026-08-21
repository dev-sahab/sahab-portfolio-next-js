import connectDB from '@/lib/mongodb'
import Tag from '@/models/Tag'
import PageHeader from '@/components/dashboard/PageHeader'
import TaxonomyManager from '@/components/dashboard/TaxonomyManager'
import '@/styles/pages/(dashboard)/dashboard/projects/projects.scss'

export default async function BlogTagsPage() {
  await connectDB()
  const tags = JSON.parse(JSON.stringify(await Tag.find({ type: 'blog' }).sort({ name: 1 }).lean()))

  return (
    <div className="dashboard-page">
      <PageHeader title="Blog Tags" subtitle={`${tags.length} total`} />
      <TaxonomyManager kind="tag" type="blog" items={tags} basePath="/dashboard/blog/tags" />
    </div>
  )
}
