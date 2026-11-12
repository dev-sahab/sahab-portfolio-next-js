import { Schema, model, models } from 'mongoose'

// Public form: length caps stop oversized submissions from bloating the inbox and DB.
const ContactSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, maxlength: 254, index: true },
  subject: { type: String, maxlength: 200 },
  budget: { type: String, maxlength: 100 },
  message: { type: String, required: true, maxlength: 10000 },
  read: { type: Boolean, default: false },
}, { timestamps: true })

export default models.Contact || model('Contact', ContactSchema)
