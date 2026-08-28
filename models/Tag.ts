import { Schema, model, models } from 'mongoose'

const TagSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  type: { type: String, required: true, enum: ['project', 'blog'], index: true },
}, { timestamps: true })

// { slug, type } below is for uniqueness — its leading key (slug) doesn't
// cover the type-only filter used by Tag.find({ type }), hence the
// standalone index above.
TagSchema.index({ slug: 1, type: 1 }, { unique: true })

export default models.Tag || model('Tag', TagSchema)
