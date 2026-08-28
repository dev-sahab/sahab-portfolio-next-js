import { Schema, model, models } from 'mongoose'

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, required: true, enum: ['project', 'blog'], index: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  description: { type: String },
}, { timestamps: true })

// { slug, type } below is for uniqueness — its leading key (slug) doesn't
// cover the type-only filter used by Category.find({ type }) (portfolio/blog
// listing pages, dashboard taxonomy pages), hence the standalone index above.
CategorySchema.index({ slug: 1, type: 1 }, { unique: true })

export default models.Category || model('Category', CategorySchema)
