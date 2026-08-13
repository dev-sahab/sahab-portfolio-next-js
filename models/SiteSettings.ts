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
    type: [{ platform: { type: String, required: true }, url: { type: String, required: true } }],
    default: () => [
      { platform: 'github', url: 'https://github.com/dev-sahab' },
      { platform: 'linkedin', url: 'https://linkedin.com/in/sahab-mi' },
    ],
  },
  services: [{ icon: String, title: String, description: String, tags: [String], order: Number }],
  skills: [{ name: String, skills: [{ name: String, level: Number }] }],
  stats: [{ value: String, label: String, target: Number, suffix: String }],

  siteTitle: { type: String, default: 'Sahab Uddin Mintu' },
  siteDescription: { type: String },
  favicon: { type: String },
  logo: { type: String },
  headerMenu: [{ label: String, href: String, order: Number }],
  footerMenu: [{ label: String, href: String, order: Number, column: String }],
  footerTagline: { type: String },
  footerCopyright: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
}, { timestamps: true })

export default models.SiteSettings || model('SiteSettings', SiteSettingsSchema)
