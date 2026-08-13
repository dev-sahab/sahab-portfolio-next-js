# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

### Data layer
Mongoose models live in `models/`. `lib/mongodb.ts` holds a cached connection (required for serverless — see the `global.mongooseCache` pattern). Key collections: `Project`, `BlogPost`, `Category`, `Tag`, `Testimonial`, `Contact`, `QuoteRequest`, `SiteSettings`, `User`, `Media`.

**Taxonomy is shared, not duplicated**: `Category` and `Tag` each have a `type: 'project' | 'blog'` discriminator instead of separate project/blog models. `lib/taxonomy.ts`'s `resolveTagIds()` lets dashboard forms submit plain tag-name strings, which get upserted into real `Tag` docs by `{slug, type}`.

### Auth
NextAuth v5, credentials-only, JWT session strategy (`lib/auth.ts`). `authorize()` checks the `User` collection first, then falls back to `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars (that fallback session's `user.id` is the literal string `"env-admin"`, not a Mongoose ObjectId). `session.user.id` is populated from `token.sub` in the `session()` callback — any code writing an ObjectId ref from it (e.g. `Media.uploadedBy`) must guard with `Types.ObjectId.isValid()` first.

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

### SEO
`app/sitemap.ts` and `app/robots.ts` are dynamic route handlers (Next's file-convention SEO APIs) that query published `Project`/`BlogPost` docs directly — there's no static sitemap file to edit. `metadataBase` in `app/layout.tsx` and the sitemap/robots base URL both read `NEXT_PUBLIC_SITE_URL`. `Project` has a `noIndex` checkbox (in the dashboard's Publish box) that sets `robots: {index:false, follow:false}` in that project's `generateMetadata()` and excludes it from the sitemap; `BlogPost` has no equivalent field yet.

### Styling — component-scoped SCSS, no Tailwind or CSS Modules despite Tailwind being installed
Every component/page owns a colocated `.scss` file (e.g. `components/site/Navbar.tsx` + `components/site/Navbar.scss`, `app/(site)/about/page.tsx` + `app/(site)/about/about.scss`) imported directly at the top of the `.tsx` file (`import './Navbar.scss'`) as a **plain global stylesheet** — not a `.module.scss`, so class names are ordinary strings in `className`, not an imported `styles` object. This is a deliberate choice to keep classes freely reusable across components/pages, the same way `app/globals.css`'s classes already are.

`app/globals.css` remains the source of truth for CSS custom properties (`--accent`, `--f-d`, `--surface`, etc., redefined under `[data-theme="light"]` for the theme toggle) and a large set of shared classes used across many pages (`.btn`/`.btn-accent`/`.btn-outline`, `.container`, `.tag`, `.h-xl`/`.h-lg`, `.page-hero`, `#site-nav`, `.footer-top`, `.form-input`, etc.) plus the global responsive breakpoints. **Colors/fonts/theme-reactive values must stay as `var(--x)` CSS custom properties** — never hardcode a hex color in a new `.scss` file for anything that should flip with the dark/light toggle.

`styles/` holds the shared SCSS layer, resolvable from *any* `.scss` file via `@use 'variables' as v;` / `@use 'mixins' as m;` (no relative path needed — `next.config.ts`'s `sassOptions.loadPaths` points at this folder):
- `_variables.scss` — compile-time-only constants that CSS custom properties can't express (breakpoints for `@media`, z-index scale, the spacing scale).
- `_mixins.scss` — `respond($bp)`, `flex(...)`, etc.
- `_utilities.scss` — Bootstrap/Tailwind-style reusable utility classes generated from the spacing scale (`.d-flex`, `.items-center`, `.justify-between`, `.gap-0`..`.gap-8`, `.mt-*`/`.mb-*`/`.p-*`/etc.), loaded globally via `styles/main.scss` (imported once in `app/layout.tsx`).

A handful of genuinely data-driven inline styles remain by design and should **not** be converted to classes: per-item colors/values computed from CMS data (e.g. `dashboard/page.tsx`'s stat-card icon color), tree-depth indentation in `CategoryCombobox`/`TaxonomyManager`, and CSS custom properties set from props (`Marquee`'s `--ms` speed, `about/page.tsx`'s skill-bar `--w`).

### Deployment
Vercel (region `sin1`, see `vercel.json`), MongoDB Atlas, Cloudinary for image storage, Resend for transactional email.
