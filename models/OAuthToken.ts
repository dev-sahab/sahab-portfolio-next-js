import { Schema, model, models } from 'mongoose'

/**
 * Access + refresh token pair issued to a connected app. Only SHA-256 hashes
 * are stored. The user's *current* role is looked up on every request, so
 * demoting or deleting a user takes effect immediately.
 */
const OAuthTokenSchema = new Schema(
  {
    accessHash: { type: String, required: true, unique: true },
    refreshHash: { type: String, required: true, unique: true },
    clientId: { type: String, required: true, index: true },
    clientName: { type: String },
    userId: { type: String, required: true, index: true },
    scope: { type: String, default: 'site' },
    accessExpiresAt: { type: Date, required: true },
    // MongoDB TTL on the refresh expiry: dead connections clean themselves up.
    refreshExpiresAt: { type: Date, required: true, index: { expires: 0 } },
    revoked: { type: Boolean, default: false },
    lastUsedAt: { type: Date },
  },
  { timestamps: true },
)

export default models.OAuthToken || model('OAuthToken', OAuthTokenSchema)
