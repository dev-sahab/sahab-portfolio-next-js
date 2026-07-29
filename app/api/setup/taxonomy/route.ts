import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Category from '@/models/Category'
import Tag from '@/models/Tag'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import { slugify } from '@/lib/utils'

const PROJECT_CATEGORY_LABELS: Record<string, string> = {
  wordpress: 'WordPress',
  woocommerce: 'WooCommerce',
  webflow: 'Webflow',
  mern: 'MERN',
  framer: 'Framer',
  other: 'Other',
}

/**
 * POST /api/setup/taxonomy
 * One-time: backfills Category/Tag collections from the legacy string
 * category/tags fields on Project and BlogPost, then relinks every
 * existing document to the new ObjectId references.
 * Safe — only runs if zero categories exist in DB.
 */
export async function POST() {
  try {
    await connectDB()
    const alreadyMigrated = await Category.countDocuments()
    if (alreadyMigrated > 0) {
      return NextResponse.json({ success: false, error: 'Taxonomy already migrated. Categories already exist.' }, { status: 400 })
    }

    let projectsUpdated = 0
    let postsUpdated = 0
    const categoriesCreated: string[] = []
    const tagsCreated: string[] = []

    // --- Projects: categories (fixed set from the old enum) ---
    const projects = await Project.find().lean()
    const projectCategoryIds: Record<string, any> = {}
    for (const [value, label] of Object.entries(PROJECT_CATEGORY_LABELS)) {
      const cat = await Category.create({ name: label, slug: slugify(label), type: 'project', parent: null })
      projectCategoryIds[value] = cat._id
      categoriesCreated.push(cat.name)
    }
    const fallbackProjectCategoryId = projectCategoryIds['other']

    // --- Projects: tags (distinct free-text values) ---
    const projectTagNames = (await Project.distinct('tags')).filter(Boolean) as unknown as string[]
    const projectTagIds: Record<string, any> = {}
    for (const name of projectTagNames) {
      const tag = await Tag.create({ name, slug: slugify(name), type: 'project' })
      projectTagIds[name] = tag._id
      tagsCreated.push(tag.name)
    }

    for (const p of projects as any[]) {
      const oldCategory = p.category as string
      const oldTags = (p.tags || []) as string[]
      const newCategoryId = projectCategoryIds[oldCategory] || fallbackProjectCategoryId
      const newTagIds = oldTags.map((t) => projectTagIds[t]).filter(Boolean)
      await Project.collection.updateOne({ _id: p._id }, { $set: { category: newCategoryId, tags: newTagIds } })
      projectsUpdated++
    }

    // --- Blog: categories (distinct free-text values) ---
    const posts = await BlogPost.find().lean()
    const blogCategoryNames = (await BlogPost.distinct('category')) as unknown as string[]
    const blogCategoryIds: Record<string, any> = {}
    for (const raw of blogCategoryNames) {
      const name = (raw || '').trim()
      if (!name) continue
      const slug = slugify(name)
      let cat = await Category.findOne({ slug, type: 'blog' })
      if (!cat) {
        cat = await Category.create({ name, slug, type: 'blog', parent: null })
        categoriesCreated.push(cat.name)
      }
      blogCategoryIds[raw] = cat._id
    }
    const uncategorizedBlog = await Category.findOneAndUpdate(
      { slug: 'uncategorized', type: 'blog' },
      { $setOnInsert: { name: 'Uncategorized', slug: 'uncategorized', type: 'blog', parent: null } },
      { upsert: true, new: true }
    )
    if (!blogCategoryNames.length) categoriesCreated.push(uncategorizedBlog.name)

    // --- Blog: tags (distinct free-text values) ---
    const blogTagNames = (await BlogPost.distinct('tags')).filter(Boolean) as unknown as string[]
    const blogTagIds: Record<string, any> = {}
    for (const name of blogTagNames) {
      const tag = await Tag.create({ name, slug: slugify(name), type: 'blog' })
      blogTagIds[name] = tag._id
      tagsCreated.push(tag.name)
    }

    for (const post of posts as any[]) {
      const oldCategory = (post.category as string) || ''
      const oldTags = (post.tags || []) as string[]
      const newCategoryId = blogCategoryIds[oldCategory] || uncategorizedBlog._id
      const newTagIds = oldTags.map((t) => blogTagIds[t]).filter(Boolean)
      await BlogPost.collection.updateOne({ _id: post._id }, { $set: { category: newCategoryId, tags: newTagIds } })
      postsUpdated++
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${projectsUpdated} projects and ${postsUpdated} posts. Created ${categoriesCreated.length} categories and ${tagsCreated.length} tags.`,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
