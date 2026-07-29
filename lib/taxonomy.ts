import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import { slugify } from '@/lib/utils'

export type TaxonomyType = 'project' | 'blog'

export async function resolveTagIds(names: string[], type: TaxonomyType) {
  await connectDB()
  const ids = []
  for (const raw of names) {
    const name = raw.trim()
    if (!name) continue
    const slug = slugify(name)
    const tag = await Tag.findOneAndUpdate(
      { slug, type },
      { $setOnInsert: { name, slug, type } },
      { upsert: true, new: true }
    )
    ids.push(tag._id)
  }
  return ids
}

export async function getOrCreateUncategorized(type: TaxonomyType) {
  await connectDB()
  const slug = 'uncategorized'
  return Category.findOneAndUpdate(
    { slug, type },
    { $setOnInsert: { name: 'Uncategorized', slug, type, parent: null } },
    { upsert: true, new: true }
  )
}
