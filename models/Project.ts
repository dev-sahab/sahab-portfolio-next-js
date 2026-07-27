import mongoose, { Schema, model, models } from 'mongoose'

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true, enum: ['wordpress','woocommerce','webflow','mern','framer','other'] },
  excerpt: { type: String, required: true },
  content: { type: String, default: '' },
  coverImage: { type: String },
  images: [{ type: String }],
  tags: [{ type: String }],
  liveUrl: { type: String },
  githubUrl: { type: String },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  year: { type: Number, default: () => new Date().getFullYear() },
  client: { type: String },
  duration: { type: String },
  stack: [{ type: String }],
}, { timestamps: true })

export default models.Project || model('Project', ProjectSchema)
