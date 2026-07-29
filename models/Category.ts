import { Schema, model, models } from 'mongoose'

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, required: true, enum: ['project', 'blog'] },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  description: { type: String },
}, { timestamps: true })

CategorySchema.index({ slug: 1, type: 1 }, { unique: true })

export default models.Category || model('Category', CategorySchema)
