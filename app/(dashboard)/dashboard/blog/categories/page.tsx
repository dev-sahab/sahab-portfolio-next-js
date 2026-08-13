import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import PageHeader from '@/components/dashboard/PageHeader'
import TaxonomyManager from '@/components/dashboard/TaxonomyManager'
import '../../projects/projects.scss'

export default async function BlogCategoriesPage() {
  await connectDB()
  const categories = JSON.parse(JSON.stringify(await Category.find({ type: 'blog' }).sort({ name: 1 }).lean()))

  return (
    <div className="dashboard-page">
      <PageHeader title="Blog Categories" subtitle={`${categories.length} total`} />
      <TaxonomyManager kind="category" type="blog" items={categories} basePath="/dashboard/blog/categories" />
    </div>
  )
}
