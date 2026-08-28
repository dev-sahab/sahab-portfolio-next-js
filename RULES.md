# Engineering Rules

> How to write code that fits this codebase. For system structure see [ARCHITECTURE.md](./ARCHITECTURE.md); for security-specific rules see [SECURITY.md](./SECURITY.md); for design tokens see [DESIGN.md](./DESIGN.md); for day-to-day repo gotchas (commands, Windows/Turbopack quirks) see [CLAUDE.md](./CLAUDE.md) — read that one first, it overrides defaults.

## 1. Golden rules

1. **`sahab-site/` is the design source of truth.** When a page needs to match the original template exactly, check there before guessing at markup/animation/styling — don't invent a new visual treatment.
2. **Every SCSS file lives under `styles/`, path-mirroring `app/`/`components/`.** Never colocate a `.scss` next to its `.tsx` again — see `CLAUDE.md § Styling`.
3. **Colors/fonts/theme-reactive values are always `var(--x)`.** Never hardcode a hex color for anything that should flip with the dark/light toggle — see `DESIGN.md`.
4. **`@/*` for every cross-boundary import**, `.tsx`/`.ts`/`.scss` alike. Never a relative path across a directory boundary.
5. **Shared types live in `types/index.ts`**, not colocated with their Mongoose model.
6. **Restart the dev server after editing any `models/*.ts`.** Mongoose caches compiled schemas in memory; new fields silently vanish on save until restart.
7. **Never trust a client-sent body wholesale into a Mongoose write.** See `SECURITY.md § Checklist for adding a new API route` — this is the single most common mistake this codebase has already made and fixed once.
8. **Public API responses check `data.success`, not HTTP status.** Route handlers always return `{ success, data | error }`; keep that shape when adding a new endpoint.

## 2. Tech choices and why

| Choice | Why | Rejected alternative |
|---|---|---|
| Webpack over Turbopack (`--webpack` flag) | Turbopack crashes on this machine compiling `.scss` (`0xc0000142`) | Turbopack (Next 16 default) |
| Plain global SCSS, not CSS Modules/Tailwind | Classes need to stay freely reusable across components the same way `globals.css` classes already are; centralizing under `styles/` is organizational, not a modules migration | Tailwind (installed but unused for authoring), CSS Modules |
| Mongoose over Prisma/a raw driver | Already the established pattern (`models/*.ts`), works fine for this document-shaped content | Prisma |
| `sanitize-html` over `isomorphic-dompurify` | `isomorphic-dompurify` pulls in `jsdom`, whose ESM-only dependency chain crashed with `ERR_REQUIRE_ESM` on Vercel's serverless runtime regardless of bundler | `isomorphic-dompurify`/`dompurify` |
| NextAuth v5 credentials provider | Staff-only auth, no need for OAuth providers or a session-table DB adapter | Custom JWT rolled by hand, OAuth-based auth |
| `loadPaths` not `includePaths` in `sassOptions` | `includePaths` is the legacy node-sass option name, silently ignored by the modern Dart Sass API `sass-loader` calls — breaks every bare `@use 'variables'` with no clear error until production build | `includePaths` |
| Shared `Category`/`Tag` models with a `type` discriminator | Avoids duplicating near-identical project/blog taxonomy models | Separate `ProjectCategory`/`BlogCategory` models |
| In-memory rate limiter, not Redis | No infra cost/dependency for current traffic; explicit upgrade path documented if needed | `@upstash/ratelimit` (no Redis provisioned yet) |

## 3. File & naming conventions

- Route handlers: `app/api/<resource>/route.ts` (list/create) + `app/api/<resource>/[id]/route.ts` (get/update/delete). One handler per HTTP verb, named `GET`/`POST`/`PUT`/`DELETE`.
- SCSS: `styles/pages/<route-path>/<name>.scss` or `styles/components/<site|dashboard>/<Name>.scss`, imported with an absolute `@/styles/...` path — one import per file, at the top of the `.tsx` it styles.
- Dashboard list pages that share one stylesheet (e.g. projects/blog new/edit/categories/tags) — check `styles/pages/(dashboard)/dashboard/projects/projects.scss` before assuming a page has no stylesheet of its own.
- Component-scoped classnames on public pages get a feature prefix when the original template's raw class name would collide or lose context (e.g. `about-timeline-item`, not `tl-item`) — see any `styles/pages/(site)/**/*.scss` for the pattern.

## 4. Patterns to follow

**API route shape** (see `SECURITY.md § Checklist for adding a new API route` for the full list):

```ts
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (!can(role, 'resource.write')) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  try {
    await connectDB()
    const { id } = await params
    const body = stripOperatorKeys(await req.json())
    const doc = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: true })
    if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: doc })
  } catch (e: any) {
    return apiError(e, 'resource/[id]')
  }
}
```

**Dashboard content forms**: `ContentForm.tsx` is one generic, schema-driven form reused by all content-editing pages — add a new content type by passing a `Field[]` array, don't write a bespoke form component. Fields marked `section: 'side'` render in the WordPress-style right sidebar.

**Staged uploads**: never upload/delete an image the instant a user interacts with it in a form — stage it (`ContentForm`'s pattern) and only commit to Cloudinary when the surrounding Save succeeds, so canceling never destroys a live image or orphans a reference.

**Taxonomy from dashboard forms**: use `resolveTagIds()` (`lib/taxonomy.ts`) to let a form submit plain tag-name strings; it upserts real `Tag` docs by `{slug, type}` rather than requiring the client to already know ObjectIds.

## 5. Anti-patterns already caught (don't reintroduce)

Each of these was a real bug found and fixed — see `SECURITY.md § Audit log` and `MEMORY.md` for the full story:

- Returning `e.message` directly from a `catch` block to the client (leaks internal error detail) — use `apiError()`.
- Spreading a raw `await req.json()` body straight into `Model.create()`/`findByIdAndUpdate()` — strip operators and/or whitelist fields first.
- A list/detail GET endpoint defaulting to "show everything" and only filtering to published content when the caller opts in via a query param — default to the *safe* filter, require permission to opt out of it.
- Interpolating unescaped user input into an HTML email template.

## 6. Definition of done (new feature / PR)

- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes if the change touches routing, API routes, or `next.config.ts`.
- [ ] Dev server restarted if any `models/*.ts` schema changed.
- [ ] New SCSS lives under `styles/`, imported with an absolute path, uses `var(--x)` for anything theme-reactive.
- [ ] New API route follows the checklist in `SECURITY.md`.
- [ ] If it changes what an agent/future contributor needs to know to work here safely or correctly — update the relevant doc (`ARCHITECTURE.md`, `SECURITY.md`, `DESIGN.md`, or `CLAUDE.md`) and add an entry to `MEMORY.md`, don't just leave it to be rediscovered from the diff.
