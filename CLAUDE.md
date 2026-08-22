# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Project documentation map

This file (always loaded) covers day-to-day repo conventions and platform gotchas. For anything deeper, read the specific file below instead of re-scanning the codebase — each is scoped to one concern so you only pay for what the task actually needs:

| File | Read it when the task involves... |
|---|---|
| [`PRD.md`](./PRD.md) | Understanding what this product is/does, who it's for, feature scope, or whether something is in/out of scope. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System structure, the full data model (every Mongoose schema's fields), env vars, deployment topology, or the request lifecycle. |
| [`RULES.md`](./RULES.md) | Writing new code — conventions, patterns to follow, tech-choice rationale, anti-patterns already caught. |
| [`DESIGN.md`](./DESIGN.md) | Touching styling, colors, typography, spacing, grids, or animations — the actual token values and conventions, not just "use CSS vars." |
| [`SECURITY.md`](./SECURITY.md) | Writing/reviewing an API route, auth, permissions, or anything handling user input — includes a concrete pre-ship checklist. |
| [`MEMORY.md`](./MEMORY.md) | Understanding *why* something is the way it is — dated log of past fixes/decisions and the reasoning behind them. |

Keep these current: if a change alters something one of these files documents, update that file and add a dated entry to `MEMORY.md` in the same piece of work — don't leave it to be rediscovered from a diff later.

## ⚠️ Next.js version warning

This repo runs **Next.js 16.2.11** and **React 19.2.4** — both newer than your training data, with breaking API/convention changes from the Next.js you know. Before writing code that touches routing, middleware, metadata, or config, check `node_modules/next/dist/docs/` for the current behavior rather than assuming.

The most important breaking change already hit in this repo: **`middleware.ts` has been renamed/replaced by `proxy.ts`**, which exports a `proxy` function (not `middleware`). See `proxy.ts` at the repo root — it wraps NextAuth's `auth` and gates `/dashboard/:path*`.

## ⚠️ Turbopack is disabled — use webpack

`npm run dev`/`npm run build` pass `--webpack` explicitly. Turbopack (Next 16's default) crashes on this machine with a Windows subprocess-spawn error (`0xc0000142`) the moment it has to compile any `.scss` file — see `next.config.ts`'s `sassOptions`. Don't remove the `--webpack` flag unless that Turbopack+Sass+Windows issue is confirmed fixed upstream.

Relatedly: `next.config.ts`'s `sassOptions` must use **`loadPaths`**, not `includePaths` — `includePaths` is the legacy node-sass option name and is silently ignored by the modern Dart Sass API that `sass-loader` calls, which breaks every bare `@use 'variables'` import project-wide with no clear error until a production build.

## Commands

```bash
npm run dev      # start dev server via webpack (localhost:3000)
npm run build    # production build via webpack (also runs the TS type check)
npm run start    # run the production build
npx tsc --noEmit # type-check only, faster than a full build
```

There is no test suite and no lint script configured in `package.json` — don't invent `npm test`/`npm run lint` commands.

### First-time setup
1. Copy `.env.example` → `.env.local` and fill in `MONGODB_URI`, `AUTH_SECRET`, `CLOUDINARY_*`, `RESEND_*`.
2. `ADMIN_EMAIL`/`ADMIN_PASSWORD` act as a fallback login (see `lib/auth.ts`) before any real `User` document exists.
3. `POST /api/setup` once to create the first real admin `User` from those env vars (route no-ops if any user already exists — see `app/api/setup/route.ts`).

### Known dev-server gotcha
Mongoose caches compiled models in memory (`models.X || model('X', Schema)` guard in every `models/*.ts` file). If you change a schema while the dev server is already running, **the running process keeps using the old compiled schema** — new/changed fields are silently dropped on save until you kill and restart `npm run dev`. Always restart the dev server after editing a model.

## Architecture

This is a single Next.js App Router project serving three things under one deployment:

- **`app/(site)/`** — the public portfolio site (home, about, portfolio + `[slug]`, blog + `[slug]`, contact, get-quote).
- **`app/(dashboard)/dashboard/`** — an admin CMS for managing all site content, gated by `proxy.ts` + `lib/auth.ts`.
- **`app/api/`** — REST-style route handlers backing the dashboard's CRUD calls (each resource has a `route.ts` list/create handler and a `[id]/route.ts` get/update/delete handler).

`sahab-site/` at the repo root is the **original static HTML/CSS/JS template** this app was rebuilt from — not part of the running app, but the authoritative design/animation/markup reference when a page needs to match the original template exactly (check there before guessing at intended styling/behavior). Its `scss/` folder is also the origin of most class names now used in `app/globals.css` and the component-level `.scss` files (see Styling below).

`@/*` (in `tsconfig.json`) resolves to the repo root, so every import — `.tsx`, `.ts`, and `.scss` alike — uses `@/lib/...`, `@/models/...`, `@/components/...`, `@/styles/...`, never a relative path across a directory boundary. Shared TS types for Mongoose-backed data (`Project`, `BlogPost`, `SiteSettings`, `User`, etc.) all live in one place, `types/index.ts`, rather than being colocated with their model.

### Data layer
Mongoose models live in `models/`. `lib/mongodb.ts` holds a cached connection (required for serverless — see the `global.mongooseCache` pattern). Key collections: `Project`, `BlogPost`, `Category`, `Tag`, `Testimonial`, `Contact`, `QuoteRequest`, `SiteSettings`, `User`, `Media`.

**Taxonomy is shared, not duplicated**: `Category` and `Tag` each have a `type: 'project' | 'blog'` discriminator instead of separate project/blog models. `lib/taxonomy.ts`'s `resolveTagIds()` lets dashboard forms submit plain tag-name strings, which get upserted into real `Tag` docs by `{slug, type}`.

### Auth
NextAuth v5, credentials-only, JWT session strategy (`lib/auth.ts`). `authorize()` checks the `User` collection first, then falls back to `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars (that fallback session's `user.id` is the literal string `"env-admin"`, not a Mongoose ObjectId, and its role is `'administrator'`). `session.user.id` is populated from `token.sub` in the `session()` callback — any code writing an ObjectId ref from it (e.g. `Media.uploadedBy`) must guard with `Types.ObjectId.isValid()` first.

### Authorization
Five WordPress-analogous roles (`models/User.ts`'s `UserRole`): `administrator`, `editor`, `author`, `contributor`, `subscriber`. `lib/permissions.ts` is the single source of truth for what each can do:
- `PERMISSIONS`: a flat map of role → allowed action strings (e.g. `'blog.write'`, `'media.read'`). `administrator` holds `['*']`, which short-circuits `can()` for everything else.
- `can(role, action)` — the check nearly every API route makes. A legacy `'admin'` role string (the enum used to be just `admin`/`editor`) is aliased to `'administrator'` inside `can()` itself, so a pre-migration `User` document keeps full access with no DB migration needed.
- `canWriteContent(role, kind, {isOwner, publishing})` — ownership-aware on top of `can()`, for roles whose permission depends on *whose* content it is (`author`'s `blog.write.own`, `contributor`'s `blog.write.own.draft`). Only `BlogPost` tracks an `author` field for this — `Project` has no role whose permission varies by ownership, so it never needs it. Contributors are blocked from ever setting `published: true`, whether creating, editing their own draft, or editing a post that's already published.
- `ROLES` — label/description per role, consumed by both the `/dashboard/users` page and `AddUserModal` so the copy only lives in one place.

Route handlers all follow the same shape: pull `role` off `session.user.role`, then gate with `can(role, '<resource>.<read|write>')` (or `canWriteContent` for blog). `components/dashboard/Sidebar.tsx` filters nav items the same way — each entry can declare a `perm` string checked against the logged-in user's role. Note this only covers the Sidebar and the API layer: a dashboard *page* itself (e.g. `/dashboard/settings`) doesn't redirect a role that can't act on it, it just gets a 403 from the API on submit.

### Media / image handling
Every Cloudinary upload (via `app/api/upload/route.ts`) creates a matching `Media` document (title/alt/caption/dimensions/uploader) — the Media Library (`/dashboard/media`) is just a browser over that collection, not a separate system. Filenames are derived from the original upload name + a random suffix (not Cloudinary's default hash id).

**Usage-checked deletion**: `lib/mediaUsage.ts` scans `Project.coverImage`/`gallery`, `BlogPost.coverImage`, and `Testimonial.avatar` in one pass to determine if an asset is still referenced anywhere. Both delete endpoints (`/api/upload` DELETE and `/api/media/[id]` DELETE) block deletion (409) if the asset is still in use — an image shared across multiple posts can't be destroyed by removing it from just one of them.

**Staged uploads/deletes in the dashboard**: `components/dashboard/ContentForm.tsx` doesn't upload or delete images the instant you interact with them. New files get an instant local `blob:` preview and are only actually pushed to Cloudinary when the surrounding post's Save succeeds; images you remove are only actually deleted from Cloudinary after that same save succeeds. This means canceling or navigating away never destroys a live image or leaves a post referencing a deleted one.

`components/dashboard/MediaPicker.tsx` is the shared "choose existing or upload new" modal used by both `ImageUpload` (single image) and `GalleryUpload` (multi-image); it supports the staged-upload flow via an `onStageUpload` callback.

### Dashboard content forms
`ContentForm.tsx` is a single generic, schema-driven form component reused by all four content-editing pages (projects new/edit, blog new/edit) — behavior is driven entirely by a `Field[]` array passed from each page, not by separate form components per content type. Fields marked `section: 'side'` render in a WordPress-style right sidebar, grouped into boxed cards by `sideGroup`; a fixed "Publish" box always sits at the top of the sidebar with checkbox fields (`featured`, `published`, `noIndex`) plus the Save/Cancel buttons.

Slug handling differs by mode: on **create**, the slug auto-fills from the title as you type (until manually edited). On **edit**, the slug field is locked by default — an "Edit" button requires an inline confirmation before unlocking it, since changing a live slug breaks existing links.

### Site settings (`SiteSettings` model, `/dashboard/settings`)
`SiteSettings` is a single-document collection (`findOneAndUpdate({}, body, {upsert:true})`) covering both a "Profile" identity (name/tagline/bio/email/phone/location/company/availability) and site-level config (siteTitle/siteDescription/favicon/logo/headerMenu/footerMenu/footerTagline/footerCopyright/contactEmail/contactPhone/stats). The dashboard page (`app/(dashboard)/dashboard/settings/page.tsx`) is a plain-state-driven 6-tab UI (General/Profile/Header Menu/Footer Menu/Footer/Hero Stats) — tabs are just conditional rendering off a `tab` state var, no router/URL involvement. `headerMenu`/`footerMenu` are `{label, href, order, column?}[]` arrays edited via the shared `MenuItemsEditor` (drag-to-reorder via native HTML5 `draggable`), and `footerMenu` groups into Pages/Services/Legal columns via the `column` field. `app/(site)/layout.tsx` fetches this document server-side once and passes it down as a `settings` prop to `Navbar`/`Footer`; `app/layout.tsx`'s `generateMetadata()` fetches it separately for `siteTitle`/`siteDescription`/`favicon`.

**Social links are a typed platform registry, not free-form fields**: `SiteSettings.social` is `{platform: string, url: string}[]` (not a fixed `{github, linkedin, ...}` object). `components/site/socialIcons.tsx` exports `SOCIAL_PLATFORMS` (~28 entries: key/label/icon component/URL placeholder) and `getSocialPlatform(key)`, which every consumer (`Footer`, `Navbar`'s mobile drawer, the contact page, and the dashboard's `SocialLinksEditor`) calls to resolve the icon/label for a given `platform` key — add a new platform or swap an icon by editing that one file only. `components/dashboard/SocialLinksEditor.tsx` is the dashboard repeater: a searchable platform combobox (filtered from `SOCIAL_PLATFORMS`) plus a URL input per row.

### Content sanitization
`blog/[slug]` and `portfolio/[slug]` render CMS-authored HTML (the `content` field, written by `components/dashboard/RichEditor.tsx`, a `react-quill-new` editor) via `dangerouslySetInnerHTML`. Both pages sanitize it first through `lib/sanitize.ts`'s `sanitizeContent()`, a `sanitize-html` wrapper whose allowlist is tuned to what that specific editor's toolbar can actually produce. This used to be `isomorphic-dompurify`, which pulls in `jsdom` — `jsdom`'s dependency chain has an ESM-only package that crashed with `ERR_REQUIRE_ESM` in Vercel's serverless runtime regardless of bundler; `sanitize-html` has no `jsdom` dependency at all, which is why it replaced it rather than the crash being tuned around.

### SEO
`app/sitemap.ts` and `app/robots.ts` are dynamic route handlers (Next's file-convention SEO APIs) that query published `Project`/`BlogPost` docs directly — there's no static sitemap file to edit. `metadataBase` in `app/layout.tsx` and the sitemap/robots base URL both read `NEXT_PUBLIC_SITE_URL`. `Project` has a `noIndex` checkbox (in the dashboard's Publish box) that sets `robots: {index:false, follow:false}` in that project's `generateMetadata()` and excludes it from the sitemap; `BlogPost` has no equivalent field yet.

### Styling — every SCSS file lives under `styles/`, no Tailwind or CSS Modules despite Tailwind being installed
Every component/page has its own `.scss` file, but none of them sit next to their `.tsx` anymore — they all live under `styles/pages/` or `styles/components/`, mirroring the `app/`/`components/` path they style (e.g. `components/site/Navbar.tsx` → `styles/components/site/Navbar.scss`; `app/(site)/about/page.tsx` → `styles/pages/(site)/about/about.scss`). Each is imported with an absolute `@/styles/...` path (`import '@/styles/components/site/Navbar.scss'`), never a relative one, as a **plain global stylesheet** — not a `.module.scss`, so class names are ordinary strings in `className`, not an imported `styles` object. Keeping them global (not modules) is deliberate, so classes stay freely reusable across components/pages, the same way `app/globals.css`'s classes already are; centralizing the folder is just so every stylesheet in the project has one home instead of being scattered file-by-file. When adding a new component/page, put its `.scss` straight into the matching `styles/components/...`/`styles/pages/...` path — don't colocate it with the `.tsx` again.

`app/globals.css` remains the source of truth for CSS custom properties (`--accent`, `--f-d`, `--surface`, etc., redefined under `[data-theme="light"]` for the theme toggle) and a large set of shared classes used across many pages (`.btn`/`.btn-accent`/`.btn-outline`, `.container`, `.tag`, `.h-xl`/`.h-lg`, `.page-hero`, `#site-nav`, `.footer-top`, `.form-input`, etc.) plus the global responsive breakpoints. **Colors/fonts/theme-reactive values must stay as `var(--x)` CSS custom properties** — never hardcode a hex color in a new `.scss` file for anything that should flip with the dark/light toggle.

`styles/` layout:
- `pages/` — one `.scss` per route, path-mirrored under `(site)/`, `(dashboard)/`, or `login/` (e.g. `pages/(site)/blog/[slug]/blog-slug.scss`).
- `components/` — one `.scss` per component, path-mirrored under `site/` or `dashboard/` (e.g. `components/dashboard/ContentForm.scss`). Note: several dashboard list pages (projects/blog, new/edit/categories/tags variants) all share the single `pages/(dashboard)/dashboard/projects/projects.scss` — check there before assuming a page has no stylesheet.
- `main.scss` — the shared layer's entry point, imported once in `app/layout.tsx`.
- `_variables.scss` — compile-time-only constants that CSS custom properties can't express (breakpoints for `@media`, z-index scale, the spacing scale).
- `_mixins.scss` — `respond($bp)`, `flex(...)`, etc.
- `_utilities.scss` — Bootstrap/Tailwind-style reusable utility classes generated from the spacing scale (`.d-flex`, `.items-center`, `.justify-between`, `.gap-0`..`.gap-8`, `.mt-*`/`.mb-*`/`.p-*`/etc.), loaded globally via `main.scss`.

`_variables.scss`/`_mixins.scss` stay resolvable from *any* `.scss` file via `@use 'variables' as v;` / `@use 'mixins' as m;` (no relative path needed — `next.config.ts`'s `sassOptions.loadPaths` points at the `styles/` folder itself, so this still works no matter how deeply nested the importing file is under `pages/`/`components/`).

A handful of genuinely data-driven inline styles remain by design and should **not** be converted to classes: per-item colors/values computed from CMS data (e.g. `dashboard/page.tsx`'s stat-card icon color), tree-depth indentation in `CategoryCombobox`/`TaxonomyManager`, and CSS custom properties set from props (`Marquee`'s `--ms` speed, `about/page.tsx`'s skill-bar `--w`).

### Deployment
Vercel (region `sin1`, see `vercel.json`), MongoDB Atlas, Cloudinary for image storage, Resend for transactional email.
