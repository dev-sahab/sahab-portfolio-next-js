import mongoose, { Schema, model, models } from 'mongoose'

const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  readTime: { type: Number },
}, { timestamps: true })

export default models.BlogPost || model('BlogPost', BlogPostSchema)
