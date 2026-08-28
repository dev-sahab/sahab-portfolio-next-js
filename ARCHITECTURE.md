# Architecture

> System structure and data model reference. For product context see [PRD.md](./PRD.md); for day-to-day repo rules (commands, gotchas, styling conventions) see [CLAUDE.md](./CLAUDE.md); for coding patterns/conventions see [RULES.md](./RULES.md); for auth/permissions detail see [SECURITY.md](./SECURITY.md).

## 1. Stack at a glance

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.11 — **webpack**, not Turbopack (see `CLAUDE.md`) |
| UI | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Database | MongoDB Atlas via Mongoose | mongoose ^9.8.0 |
| Auth | NextAuth (Auth.js) v5, credentials provider, JWT sessions | ^5.0.0-beta.32 |
| Styling | Plain global SCSS (no CSS Modules, no Tailwind despite it being installed) | sass ^1.102.0 |
| Rich text editor | react-quill-new | ^3.8.3 |
| HTML sanitization | sanitize-html | ^2.17.7 |
| Animation | GSAP + ScrollTrigger | ^3.15.0 |
| Image storage | Cloudinary | cloudinary ^2.6.1 |
| Transactional email | Resend | ^6.18.0 |
| Forms | react-hook-form + zod | ^7.82 / ^4.4 |
| Icons | lucide-react, react-icons | |
| Hosting | Vercel (region `sin1`) | see `vercel.json` |

## 2. System diagram

```
                         ┌─────────────────────────────┐
                         │        Vercel (sin1)         │
                         │                              │
  Visitor ───────────▶   │  Next.js App Router          │
                         │   ├─ app/(site)/*   (public) │
                         │   ├─ app/(dashboard)/* (CMS) │──▶ proxy.ts (NextAuth
                         │   └─ app/api/*      (REST)   │    gate on /dashboard/*)
                         │                              │
                         └───────────┬─────────┬────────┘
                                     │         │
                     ┌───────────────┘         └───────────────┐
                     ▼                                          ▼
           ┌──────────────────┐                        ┌──────────────────┐
           │  MongoDB Atlas    │                        │ Cloudinary        │
           │  (all content +   │                        │ (image storage,   │
           │   users, auth)    │                        │  transformations) │
           └──────────────────┘                        └──────────────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  Resend           │
           │  (contact/quote   │
           │   email alerts)   │
           └──────────────────┘
```

## 3. Folder structure

```
app/
  (site)/           # public portfolio: home, about, portfolio[+slug], blog[+slug], contact, get-quote
  (dashboard)/       # admin CMS, gated by proxy.ts + lib/auth.ts
    dashboard/
      blog/ projects/ media/ testimonials/ contacts/ quotes/ settings/ users/
  api/               # REST-style route handlers backing the dashboard's CRUD calls
  login/             # NextAuth credentials sign-in page
components/
  site/              # public-site components (Navbar, Footer, Marquee, AnimatedSection, TestimonialSlider, ...)
  dashboard/         # CMS components (ContentForm, MediaPicker, RichEditor, Sidebar, ...)
lib/                 # server-side utilities — see table below
models/              # Mongoose schemas, one file per collection
styles/
  pages/             # one .scss per route, path-mirrored under (site)/, (dashboard)/, login/
  components/        # one .scss per component, path-mirrored under site/ or dashboard/
  main.scss          # shared layer entry point (imported once in app/layout.tsx)
  _variables.scss    # compile-time constants (breakpoints, z-index, spacing scale)
  _mixins.scss       # respond(), flex(), circle(), uppercase-label()
  _utilities.scss    # generated utility classes (.d-flex, .gap-*, .mt-*, ...)
types/index.ts       # every shared TS type — Project, BlogPost, SiteSettings, User, etc. (not colocated with models)
sahab-site/           # ORIGINAL static HTML/CSS/JS template — reference only, not part of the running app
```

### `lib/` reference

| File | Purpose |
|---|---|
| `auth.ts` | NextAuth v5 config — credentials provider, JWT callbacks, login rate limiting. |
| `permissions.ts` | Single source of truth for role → permission strings; `can()`, `canWriteContent()`, `normalizeRole()`. |
| `mongodb.ts` | Cached Mongoose connection (serverless-safe, `global.mongooseCache`). |
| `apiError.ts` | Central API error responder — logs full error server-side, returns a safe generic message to the client. |
| `rateLimit.ts` | Best-effort in-memory rate limiter (per warm serverless instance — see `SECURITY.md`). |
| `sanitizeInput.ts` | Strips `$`-prefixed Mongo operator keys from client JSON before a Mongoose write. |
| `sanitize.ts` | `sanitizeContent()` — `sanitize-html` wrapper for CMS-authored rich-text HTML. |
| `taxonomy.ts` | `resolveTagIds()` / `getOrCreateUncategorized()` — shared Category/Tag upsert logic. |
| `mediaUsage.ts` | Scans Project/BlogPost/Testimonial for a Cloudinary URL's usage before allowing deletion. |
| `mediaTypes.ts` | Shared media-related type helpers. |
| `utils.ts` | `slugify`, `formatDate`, `calculateReadTime`, `cn`, `escapeHtml`. |

## 4. Request lifecycle

**Public page render** (e.g. `/portfolio/[slug]`): Server Component → `connectDB()` → Mongoose query direct (filtered `published: true`) → render. No REST API involved — public pages never call `/api/*`.

**Dashboard read** (e.g. edit-project page): Server Component → `connectDB()` → Mongoose query direct by `_id`. Also bypasses the REST API.

**Dashboard write** (create/update/delete): Client component (`ContentForm`, `DeleteButton`, etc.) → `fetch()` to the matching `/api/<resource>[/[id]]` route → route handler checks `auth()` + `can()`/`canWriteContent()` → Mongoose write → JSON response (`{ success, data | error }`, checked client-side via `data.success`, not HTTP status).

**Media**: upload goes through `/api/upload` (server-side Cloudinary call, never a client-side unsigned upload) → creates a `Media` document. Deletes are usage-checked (`lib/mediaUsage.ts`) and 409 if the asset is still referenced.

## 5. Data models

All models: `models/*.ts`, guarded with `models.X || model('X', Schema)` (Mongoose dev-server hot-reload gotcha — see `CLAUDE.md`). All have Mongoose `{ timestamps: true }` unless noted.

### Project
| Field | Type | Notes |
|---|---|---|
| title, slug | String | slug unique |
| category | ObjectId → Category | required |
| excerpt, content | String | content is Markdown/case-study body |
| coverImage, gallery | String / String[] | Cloudinary URLs |
| tags | ObjectId[] → Tag | |
| liveUrl, githubUrl | String | |
| featured, published | Boolean | published default `true` |
| noIndex | Boolean | drives `robots: {index:false}` + sitemap exclusion |
| year, client, duration, stack | misc | |

### BlogPost
| Field | Type | Notes |
|---|---|---|
| title, slug, excerpt, content | String | content required, rendered via `sanitizeContent()` |
| coverImage | String | |
| category | ObjectId → Category | required |
| tags | ObjectId[] → Tag | |
| author | ObjectId → User | optional — drives ownership checks in `canWriteContent()` |
| published | Boolean | default **`false`** (unlike Project) |
| featured, readTime | misc | readTime auto-calculated on save |

### Category / Tag
Shared taxonomy — `type: 'project' | 'blog'` discriminator instead of separate models. Both index `{ slug: 1, type: 1 }` unique. Category supports a `parent` (self-ref, hierarchical).

### Testimonial
`name, role, company?, avatar?, content, rating(1-5), featured, order`.

### Contact
`name, email, subject?, budget?, message, read` — from the public `/contact` form.

### QuoteRequest
`name, email, url?, service, uiux?, platform?, pages?, websiteType?, timeline?, features[], notes?, estimatedTimeline?, read` — from `/get-quote`.

### SiteSettings
Single-document collection (`findOneAndUpdate({}, body, {upsert:true})`). Profile identity (`name, tagline, bio, email, phone, location, company, availability, availabilityText`), `social: {platform, url}[]` (see `components/site/socialIcons.tsx`), `services[]`, `skills[]`, `stats[]`, plus site config (`siteTitle, siteDescription, favicon, logo, headerMenu[], footerMenu[], footerTagline, footerCopyright, contactEmail, contactPhone`).

> Note: `SiteSettings.skills`/`.stats` exist in the schema but the About page currently renders its own hardcoded `skillGroups`/`timeline` arrays rather than reading from settings — see `MEMORY.md` if this gets unified later.

### User
`name, email(unique), password(bcrypt hash, cost 12), role(enum, default 'editor'), active`. `comparePassword()` instance method.

### Media
`url, publicId(unique), filename, title, altText, caption, mimeType, width, height, size, folder, uploadedBy → User`.

## 6. Auth & permissions (summary)

NextAuth v5, credentials-only, JWT strategy. `authorize()` checks `User` first, falls back to `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars (session `user.id` = literal `"env-admin"` in that case — guard with `Types.ObjectId.isValid()` before using it as a ref). Full detail, role matrix, and the permission-check pattern every API route follows: **[SECURITY.md § Authorization model](./SECURITY.md#authorization-model)**.

## 7. Environment variables

| Var | Purpose | Required |
|---|---|---|
| `MONGODB_URI` | Atlas connection string | Yes — app throws on boot without it |
| `AUTH_SECRET` | NextAuth JWT signing secret | Yes |
| `NEXTAUTH_URL` | Canonical site URL for NextAuth | Yes |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin login, used by `/api/setup` and the `authorize()` fallback | Yes until first real `User` exists |
| `ADMIN_NAME` | Display name for the bootstrap admin | No |
| `RESEND_API_KEY` / `RESEND_FROM` / `RESEND_TO` | Contact/quote email notifications | No — routes degrade gracefully (log + continue) if unset |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image upload/storage | Yes for media features |
| `NEXT_PUBLIC_SITE_URL` | `metadataBase`, sitemap/robots base URL | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Public branding | No |

Full setup steps: `CLAUDE.md § First-time setup`. Secrets-handling rules: `SECURITY.md § Secrets handling`.

## 8. Deployment topology

Vercel (region `sin1`, `vercel.json` forces `--webpack` build — Turbopack previously caused production 500s, see `MEMORY.md` 2026-08-17). MongoDB Atlas (external, TLS via `mongodb+srv://`). Cloudinary for all image storage — the app's own domain never serves user-uploaded files. Resend for transactional email only (no marketing/bulk email).

## 9. Platform constraints

Windows-specific dev gotchas (Turbopack crash, `sassOptions.loadPaths` vs `includePaths`, Mongoose model-cache-on-hot-reload) are documented once, in `CLAUDE.md` — don't duplicate them here; read that file before touching `next.config.ts`, `proxy.ts`, or any `models/*.ts` file.
