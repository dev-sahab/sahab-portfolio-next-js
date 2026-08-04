# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Next.js version warning

This repo runs **Next.js 16.2.11** and **React 19.2.4** — both newer than your training data, with breaking API/convention changes from the Next.js you know. Before writing code that touches routing, middleware, metadata, or config, check `node_modules/next/dist/docs/` for the current behavior rather than assuming.

The most important breaking change already hit in this repo: **`middleware.ts` has been renamed/replaced by `proxy.ts`**, which exports a `proxy` function (not `middleware`). See `proxy.ts` at the repo root — it wraps NextAuth's `auth` and gates `/dashboard/:path*`.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build (also runs the TS type check)
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

`sahab-site/` at the repo root is the **original static HTML/CSS/JS template** this app was rebuilt from — not part of the running app, but the authoritative design/animation/markup reference when a page needs to match the original template exactly (check there before guessing at intended styling/behavior).

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

### SEO
`app/sitemap.ts` and `app/robots.ts` are dynamic route handlers (Next's file-convention SEO APIs) that query published `Project`/`BlogPost` docs directly — there's no static sitemap file to edit. `metadataBase` in `app/layout.tsx` and the sitemap/robots base URL both read `NEXT_PUBLIC_SITE_URL`. `Project` has a `noIndex` checkbox (in the dashboard's Publish box) that sets `robots: {index:false, follow:false}` in that project's `generateMetadata()` and excludes it from the sitemap; `BlogPost` has no equivalent field yet.

### Styling — no Tailwind despite it being installed
Tailwind is a devDependency but the app does **not** use Tailwind utility classes. Actual styling is React inline `style={{}}` objects referencing CSS custom properties defined in `app/globals.css` (`var(--accent)`, `var(--f-d)`, `var(--surface)`, etc.), which also defines dark/light theme values under `[data-theme="light"]`. A handful of real CSS classes in `globals.css` exist only for what inline styles can't express — `:hover` states, keyframe animations, and media-query breakpoints (e.g. `.tag`, `.btn`, `.sp-*` project-page classes, `.lb-*` lightbox classes, `.cf-grid` dashboard form grid).

Theme is `data-theme="dark"|"light"` on `<html>`, toggled client-side (`ThemeToggle.tsx`) and persisted to `localStorage`; an inline `<script>` in `app/layout.tsx` applies the saved theme before hydration to prevent a flash.

### Deployment
Vercel (region `sin1`, see `vercel.json`), MongoDB Atlas, Cloudinary for image storage, Resend for transactional email.
