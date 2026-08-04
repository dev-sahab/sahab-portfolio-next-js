import { Schema, model, models } from 'mongoose'

const MediaSchema = new Schema({
  url:       { type: String, required: true },
  publicId:  { type: String, required: true, unique: true },
  filename:  { type: String, required: true },
  title:     { type: String, default: '' },
  altText:   { type: String, default: '' },
  caption:   { type: String, default: '' },
  mimeType:  { type: String },
  width:     { type: Number },
  height:    { type: Number },
  size:      { type: Number },
  folder:    { type: String, default: 'sahab-portfolio' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default models.Media || model('Media', MediaSchema)
