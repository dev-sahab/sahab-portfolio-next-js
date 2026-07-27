import { Schema, model, models } from 'mongoose'

const TestimonialSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String },
  avatar: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export default models.Testimonial || model('Testimonial', TestimonialSchema)
