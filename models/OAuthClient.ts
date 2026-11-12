import { Schema, model, models } from 'mongoose'

/**
 * An app registered through OAuth Dynamic Client Registration (RFC 7591),
 * e.g. Claude or ChatGPT adding this site as an MCP connector. Public
 * clients (no secret): security comes from PKCE + exact redirect URIs.
 */
const OAuthClientSchema = new Schema(
  {
    clientId: { type: String, required: true, unique: true },
    clientName: { type: String, default: 'Unnamed app' },
    redirectUris: [{ type: String, required: true }],
    clientUri: { type: String },
    logoUri: { type: String },
  },
  { timestamps: true },
)

export default models.OAuthClient || model('OAuthClient', OAuthClientSchema)
