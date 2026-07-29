import { Schema, model, models } from 'mongoose'

const TagSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, required: true, enum: ['project', 'blog'] },
}, { timestamps: true })

TagSchema.index({ slug: 1, type: 1 }, { unique: true })

export default models.Tag || model('Tag', TagSchema)
