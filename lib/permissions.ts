import type { UserRole } from '@/models/User'

export type { UserRole }

export interface RoleInfo {
  value: UserRole
  label: string
  description: string
}

// Single source of truth for role labels/descriptions — the dashboard Users
// page, AddUserModal, and anywhere else a role needs a human-readable name
// all read from this list instead of duplicating the copy.
export const ROLES: RoleInfo[] = [
  { value: 'administrator', label: 'Administrator', description: 'Full access, manage users and settings' },
  { value: 'editor', label: 'Editor', description: 'Manage all content, cannot manage users/settings' },
  { value: 'author', label: 'Author', description: 'Write and publish own posts and projects' },
  { value: 'contributor', label: 'Contributor', description: 'Write drafts only, editor/admin publishes' },
  { value: 'subscriber', label: 'Subscriber', description: 'View-only dashboard access' },
]

// WordPress-style flat permission strings per role. administrator's '*'
// short-circuits can() for everything else.
//
// projects/blog/testimonials/contacts/quotes are the resources named in the
// original spec. categories/tags/media/settings/users aren't, but every
// dashboard API route needs *something* to check, so those were added here
// following the same WordPress-analogous logic used for the rest of the map:
// editors manage all content including taxonomy and the media library but
// not users/settings; authors can tag their own posts and upload media (real
// WordPress authors can too) but can't touch categories or projects; real
// WordPress contributors cannot upload media at all, so `media.write` is
// intentionally absent from their list.
export const PERMISSIONS: Record<UserRole, string[]> = {
  administrator: ['*'],
  editor: [
    'projects.read', 'projects.write',
    'blog.read', 'blog.write',
    'testimonials.read', 'testimonials.write',
    'contacts.read',
    'quotes.read',
    'categories.read', 'categories.write',
    'tags.read', 'tags.write',
    'media.read', 'media.write',
  ],
  author: [
    'blog.read', 'blog.write.own',
    'projects.read',
    'categories.read',
    'tags.read', 'tags.write',
    'media.read', 'media.write',
  ],
  contributor: [
    // can write but not publish
    'blog.read', 'blog.write.own.draft',
    'categories.read',
    'tags.read',
    'media.read',
  ],
  subscriber: ['read.only'],
}

// Pre-migration User documents still have the literal string "admin" stored
// in the DB (the enum used to be ['admin', 'editor']) — Mongoose doesn't
// validate on read, so those load fine, but without this alias every
// existing admin account would silently lose all permissions the moment
// this shipped, since 'admin' isn't a key in PERMISSIONS. No DB migration
// needed: this makes both spellings resolve identically, forever.
const LEGACY_ROLE_ALIASES: Record<string, UserRole> = { admin: 'administrator' }

export function normalizeRole(role: string | undefined): UserRole | undefined {
  if (!role) return undefined
  return LEGACY_ROLE_ALIASES[role] || (role as UserRole)
}

export function can(role: string | undefined, action: string): boolean {
  const perms = PERMISSIONS[normalizeRole(role) as UserRole] || []
  return perms.includes('*') || perms.includes(action)
}

/**
 * Ownership-aware write check for content whose model tracks an `author`
 * field (currently just BlogPost — Project has no role whose permission
 * varies by ownership, so it never needs this).
 *
 * - A flat `<kind>.write` permission (editor/administrator) always passes,
 *   regardless of ownership.
 * - `<kind>.write.own` (author) requires `isOwner`.
 * - `<kind>.write.own.draft` (contributor) requires `isOwner` AND blocks the
 *   request if it would publish the content — contributors can save drafts
 *   but never flip `published` to true themselves.
 */
export function canWriteContent(
  role: string | undefined,
  kind: string,
  opts: { isOwner: boolean; publishing: boolean }
): boolean {
  if (can(role, `${kind}.write`)) return true
  if (!opts.isOwner) return false
  if (can(role, `${kind}.write.own`)) return true
  if (can(role, `${kind}.write.own.draft`)) return !opts.publishing
  return false
}
