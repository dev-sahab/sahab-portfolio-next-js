import mongoose, { Schema, model, models } from 'mongoose'

const BlogPostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  readTime: { type: Number },
}, { timestamps: true })

export default models.BlogPost || model('BlogPost', BlogPostSchema)
