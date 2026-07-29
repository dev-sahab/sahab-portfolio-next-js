import connectDB from '@/lib/mongodb'
import Tag from '@/models/Tag'
import PageHeader from '@/components/dashboard/PageHeader'
import TaxonomyManager from '@/components/dashboard/TaxonomyManager'

export default async function ProjectTagsPage() {
  await connectDB()
  const tags = JSON.parse(JSON.stringify(await Tag.find({ type: 'project' }).sort({ name: 1 }).lean()))

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Project Tags" subtitle={`${tags.length} total`} />
      <TaxonomyManager kind="tag" type="project" items={tags} basePath="/dashboard/projects/tags" />
    </div>
  )
}
