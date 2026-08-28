import { Schema, model, models } from 'mongoose'

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  excerpt: { type: String, required: true },
  content: { type: String, default: '' },
  coverImage: { type: String },
  gallery: [{ type: String }],
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  liveUrl: { type: String },
  githubUrl: { type: String },
  featured: { type: Boolean, default: false, index: true },
  published: { type: Boolean, default: true, index: true },
  noIndex: { type: Boolean, default: false },
  year: { type: Number, default: () => new Date().getFullYear() },
  client: { type: String },
  duration: { type: String },
  stack: [{ type: String }],
}, { timestamps: true })

// Matches the public site's actual query shape (portfolio listing + home
// page): filter by published, sort by featured then recency.
ProjectSchema.index({ published: 1, featured: -1, createdAt: -1 })

export default models.Project || model('Project', ProjectSchema)
