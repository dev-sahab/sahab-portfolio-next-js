import { Schema, model, models } from 'mongoose'

const QuoteRequestSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  url: { type: String },
  service: { type: String, required: true },
  uiux: { type: String },
  platform: { type: String },
  pages: { type: Number },
  websiteType: { type: String },
  timeline: { type: String },
  features: [{ type: String }],
  notes: { type: String },
  estimatedTimeline: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true })

export default models.QuoteRequest || model('QuoteRequest', QuoteRequestSchema)
