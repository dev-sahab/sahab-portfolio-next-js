import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import PageHeader from '@/components/dashboard/PageHeader'
import TaxonomyManager from '@/components/dashboard/TaxonomyManager'

export default async function ProjectCategoriesPage() {
  await connectDB()
  const categories = JSON.parse(JSON.stringify(await Category.find({ type: 'project' }).sort({ name: 1 }).lean()))

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Project Categories" subtitle={`${categories.length} total`} />
      <TaxonomyManager kind="category" type="project" items={categories} basePath="/dashboard/projects/categories" />
    </div>
  )
}
