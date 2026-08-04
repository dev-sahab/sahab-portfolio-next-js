import connectDB from './mongodb'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import Testimonial from '@/models/Testimonial'

export interface MediaReference {
  type: 'project' | 'blog' | 'testimonial'
  id: string
  title: string
}

/** One pass over every content collection that can hold an image URL — O(1) queries
 *  regardless of how many media assets you're checking, instead of N+1 per-asset lookups. */
export async function getAllReferencedUrls(): Promise<Map<string, MediaReference[]>> {
  await connectDB()
  const [projects, posts, testimonials] = await Promise.all([
    Project.find({}, 'title coverImage gallery').lean(),
    BlogPost.find({}, 'title coverImage').lean(),
    Testimonial.find({}, 'name avatar').lean(),
  ])

  const map = new Map<string, MediaReference[]>()
  const add = (url: string | undefined | null, ref: MediaReference) => {
    if (!url) return
    const list = map.get(url) || []
    list.push(ref)
    map.set(url, list)
  }

  ;(projects as any[]).forEach(p => {
    add(p.coverImage, { type: 'project', id: String(p._id), title: p.title })
    ;(p.gallery || []).forEach((g: string) => add(g, { type: 'project', id: String(p._id), title: p.title }))
  })
  ;(posts as any[]).forEach(p => add(p.coverImage, { type: 'blog', id: String(p._id), title: p.title }))
  ;(testimonials as any[]).forEach(t => add(t.avatar, { type: 'testimonial', id: String(t._id), title: t.name }))

  return map
}

export async function checkMediaUsage(url: string): Promise<{ inUse: boolean; references: MediaReference[] }> {
  const map = await getAllReferencedUrls()
  const references = map.get(url) || []
  return { inUse: references.length > 0, references }
}
