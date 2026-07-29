import { Schema, model, models } from 'mongoose'
import bcrypt from 'bcryptjs'

export type UserRole = 'admin' | 'editor'

const UserSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  role:     { type: String, enum: ['admin', 'editor'], default: 'editor' },
  active:   { type: Boolean, default: true },
}, { timestamps: true })

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password)
}

export default models.User || model('User', UserSchema)
