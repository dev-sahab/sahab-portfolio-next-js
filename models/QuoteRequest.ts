import { Schema, model, models } from 'mongoose'

// Public form: length caps stop oversized submissions from bloating the inbox and DB.
const QuoteRequestSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, maxlength: 254, index: true },
  url: { type: String, maxlength: 500 },
  service: { type: String, required: true, maxlength: 200 },
  uiux: { type: String, maxlength: 200 },
  platform: { type: String, maxlength: 200 },
  pages: { type: Number, min: 0, max: 10000 },
  websiteType: { type: String, maxlength: 200 },
  timeline: { type: String, maxlength: 200 },
  features: { type: [{ type: String, maxlength: 200 }], validate: [(v: string[]) => v.length <= 50, 'Too many features'] },
  notes: { type: String, maxlength: 10000 },
  estimatedTimeline: { type: String, maxlength: 200 },
  read: { type: Boolean, default: false },
}, { timestamps: true })

export default models.QuoteRequest || model('QuoteRequest', QuoteRequestSchema)
