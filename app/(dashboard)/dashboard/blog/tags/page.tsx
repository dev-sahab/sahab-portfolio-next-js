import connectDB from '@/lib/mongodb'
import Tag from '@/models/Tag'
import PageHeader from '@/components/dashboard/PageHeader'
import TaxonomyManager from '@/components/dashboard/TaxonomyManager'

export default async function BlogTagsPage() {
  await connectDB()
  const tags = JSON.parse(JSON.stringify(await Tag.find({ type: 'blog' }).sort({ name: 1 }).lean()))

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Blog Tags" subtitle={`${tags.length} total`} />
      <TaxonomyManager kind="tag" type="blog" items={tags} basePath="/dashboard/blog/tags" />
    </div>
  )
}
