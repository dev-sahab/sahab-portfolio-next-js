import { Schema, model, models } from 'mongoose'

/** Single-use authorization code (10 minutes). Only its SHA-256 hash is stored. */
const OAuthCodeSchema = new Schema({
  codeHash: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  userId: { type: String, required: true },
  redirectUri: { type: String, required: true },
  codeChallenge: { type: String, required: true },
  scope: { type: String, default: 'site' },
  resource: { type: String },
  // MongoDB TTL: the document disappears once expired.
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
})

export default models.OAuthCode || model('OAuthCode', OAuthCodeSchema)
