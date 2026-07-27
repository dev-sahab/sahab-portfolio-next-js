import { Schema, model, models } from 'mongoose'

const SiteSettingsSchema = new Schema({
  name: { type: String, default: 'Sahab Uddin Mintu' },
  tagline: { type: String, default: 'WordPress & MERN Developer' },
  bio: { type: String, default: '' },
  email: { type: String, default: 'frshahab.me@gmail.com' },
  phone: { type: String },
  location: { type: String, default: 'Sylhet, Bangladesh' },
  company: { type: String, default: 'PIXELVEGA' },
  availability: { type: Boolean, default: true },
  availabilityText: { type: String, default: 'Available for new projects' },
  social: {
    github: { type: String, default: 'https://github.com/dev-sahab' },
    linkedin: { type: String, default: 'https://linkedin.com/in/sahab-mi' },
    twitter: { type: String },
    upwork: { type: String },
  },
  services: [{ icon: String, title: String, description: String, tags: [String], order: Number }],
  skills: [{ name: String, skills: [{ name: String, level: Number }] }],
  stats: [{ value: String, label: String, target: Number, suffix: String }],
}, { timestamps: true })

export default models.SiteSettings || model('SiteSettings', SiteSettingsSchema)
