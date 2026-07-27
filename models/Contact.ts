import { Schema, model, models } from 'mongoose'

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  budget: { type: String },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true })

export default models.Contact || model('Contact', ContactSchema)
