# Memory — decision & change log

> Reverse-chronological log of significant fixes and decisions, with the *why* — so a new agent (or future-you) understands why the code looks the way it does instead of re-discovering it from the diff. Not a full commit log (`git log` already has that) — only entries that carry a decision or a lesson. Add an entry here whenever you make a change another agent would otherwise waste tokens re-deriving.
>
> For the current state of things (not the history), see [ARCHITECTURE.md](./ARCHITECTURE.md), [SECURITY.md](./SECURITY.md), [DESIGN.md](./DESIGN.md), [RULES.md](./RULES.md).

---

### 2026-11-11 — v8 polish: SVG logo, real tech logos, services copy, marquee drag, hero card animation

Supersedes parts of the 2026-11-10 v8 entry's follow-ups (below):
- **Logo is now SVG** (`public/v8/logo-dark.svg` / `logo-light.svg`, plain `<img>` in `Logo.tsx`), built from the Figma **Home v7** frames (Dark `64:1200`, Light `65:1250`) — Sahab chose v7 over v8's logo (v8 has "/ full-stack", v7 "/full-stack"). Title/subtitle are Figma's own outlined paths; the person mark is a *raster* in Figma, so it was traced (potrace) from its 1254px original. To update: re-export those nodes with `download_assets` (svg) and rebuild. The old PNG logos are gone.
- **Every tech logo is the real brand mark** — `lib/v8/monogram.tsx` was deleted. Crocoblock, n8n, Memberstack and Woo (W-in-circle) are inline components in `lib/v8/tech.tsx` (not in Simple Icons / react-icons); Memberstack's mark lives in `public/v8/logos/memberstack.svg`. Added Laravel, MySQL, PostgreSQL, Prisma.
- **Tools marquee**: hover-pause removed; drag-to-pan added (one row at a time, with momentum). Scroll boost unchanged.
- **Hero "Performance budget" card**: `ScoreRing.tsx` counts 0→90+ and fills the ring with a colour shift, starting exactly when the card's entry animation starts (SSR markup starts at 0 so the final value never flashes). Float cards are text-selectable (`pointer-events: auto` per card; the layer itself stays `none`).
- **Services**: "View all services" link → `/services` (page doesn't exist yet — 404 until built); card copy reworked; `SectionHeader` got an optional `action` slot. Project count is **300+** site-wide (the "120+" in the timeline is only the PIXELVEGA role's figure).
- About timeline line/dots/version badges use a soft accent tint; footer legal border matches the wordmark tone.

### 2026-11-11 — `main` was tampered with by two force-pushes; sanitized with a `-s ours` merge

On 2026-11-10 (09:00 and 09:04 UTC) two force-pushes under the `dev-sahab` account replaced the real `main` tip `548698f` (the 404-page redesign) with `aa14129`. That commit has the identical 404 files **plus** hostile changes: a new `init` file (a harmless-looking module with a ~31 KB obfuscated blob on its last line), a second obfuscated blob appended after the real config in `postcss.config.mjs` (PostCSS runs on every build, so Vercel's production build executed it), `node init &&` prefixed onto the `dev`/`build`/`start` scripts, and `.gitignore` stripped of `.env` / `.env.local` (plus `config.bat` added to the ignore list). Vercel deployed it to production at 09:10 UTC.

Fix: merged `origin/main` into `feat/v8-homepage` with `git merge -s ours`, so the merge keeps this branch's clean tree and none of the injected files, then merged the PR. History keeps the bad commit; the tree is clean. No secrets were ever committed (only `.env.example` is tracked).

**Rules for future work:** never run `node init`; never remove `.env` / `.env.local` from `.gitignore`; if a config file has a line thousands of characters long, a script runs a file you don't recognise, or `init` / `config.bat` appears, stop and tell Sahab. All production secrets (MongoDB, `AUTH_SECRET`, `ADMIN_PASSWORD`, Cloudinary, Resend) and GitHub/Vercel tokens should be treated as exposed and rotated.

### 2026-11-10 — v8 homepage redesign built as a standalone `/v8` route

Built Figma "Home v8" (file `mMrihrVbG8dz4bheB6Dd2k`, frames `68:1295` dark / `72:1348` light) as a separate route so it can replace the current homepage later without touching any existing page. Interactions were ported from `html-template/new/homepage-preview-v8.html` (⌘K command menu, hover-scroll screenshots, copy-email toast) plus the Figma-annotated ones (scroll-linked tool marquee, auto-cycling process steps, one-open accordion, theme toggle). Figma's placeholder icons were replaced with real logos via `react-icons/si` (registry: `lib/v8/tech.tsx`) and Lucide UI icons.

Decisions worth knowing:
- **Isolation**: `app/v8/` sits outside `(site)`, so the old Navbar/Footer/Cursor don't load. All classes are `v8-` prefixed and tokens use distinct names (`--bg-base`, `--text-primary`…) scoped under `.v8`, because `app/globals.css` (always loaded by the root layout) already owns global `.btn`/`.container`/`--bg`/`--text`. Same `data-theme` + `sahab-theme` storage key as the old site, so the theme choice carries over.
- **All content is static** in `content/v8/*.ts` (user asked for no DB for now). Four of the five FAQ answers, the budget/timeline options, the legal links and the `/portfolio` case-study links are placeholders and are marked TODO in those files.
- **Quote form** has no backend; `lib/v8/quote.ts` builds a `mailto:` link. Swap `buildQuoteMailto` for a POST to `/api/quote` when wiring it up.
- **Reveal-on-scroll is JS-failure-safe**: content is only hidden once an inline script sets `html.v8-js`, and if React never hydrates (`v8-hydrated` never set) a CSS fallback animation shows everything after 2.5s. This was added after finding that **in `npm run dev` the CSP from `next.config.ts` (no `'unsafe-eval'`) blocks webpack's eval-based dev chunks, so no page hydrated in dev** (whole site, pre-existing). Fixed by adding `'unsafe-eval'` to `script-src` only when `NODE_ENV !== 'production'`; the production policy is unchanged.
- **Tool marquee** is a rAF loop (`ToolsMarquee.tsx`): slow idle drift + a decaying boost from scroll velocity, direction follows the last scroll direction (down → row 1 left / row 2 right, up → flipped), position wraps at one list-copy's width (list rendered 4× so ~2800px-wide viewports never show a gap). Runs only while the section is on screen.
- `/v8` is `noindex` via its layout metadata until it replaces `/`.
- **2026-11-11 follow-ups** (driven by the Figma file's per-section "Note · Interaction 0x" frames next to Home v8 — read those before changing behaviour): scroll-spy + 80px blur header, system-theme default, eased mouse-follow + scroll parallax on hero cards, 40s marquee loop with per-row hover pause, 6s hover-scroll + "View" cursor, card lift/tooltips, timeline draw-in, stat count-up, inline form validation. The quote form now **POSTs to the existing `/api/quote`** (so submissions land in the dashboard + Resend email); mailto is only the error fallback. Wide wordmark logos (Woo, Wix, GSAP, PHP, n8n) and logo-less tools render as brand-coloured monograms (`lib/v8/monogram.tsx`, flagged `hasBackground`); `TechIcon variant="badge"` puts transparent glyphs on a white disc, always round. Clipboard falls back to `execCommand` because `navigator.clipboard` is undefined on non-secure origins (LAN IP in dev). Spotlight hover from `homepage-preview-v6.html` is the shared `.v8-spotlight` class.
- **2026-11-11 (later):** **Logo is an image** (`public/v8/logo-dark.png` / `logo-light.png`, 752×188, transparent, rendered at 4× from the Figma "Logo v3" spec; text colour is baked in so there's one file per theme, switched by CSS on `data-theme`). Re-export if the logo changes. Its height is in `em` with a fluid root font-size, so it shrinks below 390px wide. **Favicon** = the person mark, as `app/v8/icon.png` + `app/v8/apple-icon.png` — scoped to `/v8` only (the old site keeps `app/icon.tsx` until v8 replaces `/`; to go site-wide, move the two files to `app/`). **Smooth scroll = Lenis** (`components/v8/providers/SmoothScroll.tsx`, new dep `lenis`), not GSAP ScrollSmoother (which wraps the page in a transformed container and breaks sticky/fixed). Lenis reads CSS `scroll-padding-top` itself, so **never pass a manual offset to `scrollTo`** (it doubled the offset once); `--nav-h` lives on `<html>` for that reason. Anything that locks scrolling must use `lockScroll()` from `lib/v8/smoothScroll.ts` (stops Lenis too). **Header** is transparent at the top (hero is pulled up under it with a negative margin) and gets blur/background after 80px. **Mobile menu** is now the Figma full-screen sheet (`MobileMenu.tsx`: 250ms fade, scroll lock, Esc/X/swipe-up close, focus trap, search row opens a full-screen search). Stats stay 2×2 on phones (the Figma note says "rows" but Sahab asked for the 2-column grid).
- **Mobile menu gotcha:** the header's `backdrop-filter` (scrolled state) makes it the containing block for `position: fixed` descendants, so the dim backdrop must be a *sibling* of `<header>` (`.v8-menu-backdrop`), not a child. The menu panel is an absolute overlay (never in-flow) so anchor jumps land under the header. Footer wordmark sizes from content width (`--wm-size`), not `vw`, so it never clips sideways; the Figma mobile frame had the text layer at left:559px in a 350px frame, which is why it looked missing there.

### 2026-08-28 — Portfolio gallery Lightbox: zoomed image had a horizontal scrollbar and an unreachable top edge

Two bugs in `components/site/Lightbox.tsx` (used by `portfolio/[slug]/page.tsx` for the project gallery), both from the same root cause: `ZOOM_STEPS`'s non-`'fit'` values were multiples of the image's *native pixel size*, not of the viewport. For a tall image (e.g. a full-page screenshot gallery asset) whose native width happened to exceed the lightbox's available width, the very first zoom-in click (125% of native) already rendered wider than the viewport — hence the horizontal scrollbar.

Separately, `.lb-img-wrap` centered its (potentially overflowing) child via `align-items:center; justify-content:center` on a flex container with `overflow:auto`. That's the classic "centered flex/grid child + overflow" trap: the browser only lets you scroll to the *reachable* side of the centering offset, and doesn't extend the scrollable region to the start edge the way it does for normal (non-alignment-based) overflow — so once the zoomed image was taller than the container, its top portion was genuinely unreachable by scrolling, not just off-screen.

Fixed both:
1. Redefined the zoom steps as multiples of *fit-width scale* (`container.w / natural.w`) instead of native pixel size — `ZOOM_STEPS` is now `['fit', 1, 1.25, 1.5, 1.75, 2]`, so the first click-to-zoom step (index 1) always renders at exactly 100% of the viewport width, guaranteeing no horizontal scrollbar on that step; only the further manual +/- steps zoom in past that (where horizontal scroll becomes expected/deliberate).
2. Replaced the flex `align-items`/`justify-content` centering on `.lb-img-wrap` with `margin: auto` on `.lb-img` itself (`app/globals.css`) — auto margins collapse to 0 instead of clipping when the child overflows, which keeps the scrollable region reachable all the way to the image's real top-left. Added an explicit `wrapRef.scrollTop/scrollLeft = 0` reset on every zoom-level change as a belt-and-suspenders guarantee that zooming in always opens scrolled to the top, rather than relying on incidental browser scroll-position defaults. Also added `scrollbar-gutter: stable` on `.lb-img-wrap` so a vertical scrollbar appearing (once a tall zoomed image overflows) doesn't shave a few pixels off the width that was already computed to exactly match the container before that scrollbar existed.

### 2026-08-23 — Documentation set created (this file + PRD/ARCHITECTURE/RULES/DESIGN/SECURITY.md)

Created so a fresh agent session can read a handful of targeted docs instead of re-scanning the whole codebase to answer "what is this app / how is it built / what are the rules / what does it look like / what's the security posture." `CLAUDE.md` stays the primary always-loaded reference (repo conventions, Windows/Turbopack gotchas, commands); these files are the deeper, task-specific references it now points to.

### 2026-08-23 — Full 5-check security audit; several real bugs fixed

Prompted by a "vibe-coding security prompts" checklist PDF (Gitleaks/Bearer/production-audit/Trail-of-Bits/attacker's-perspective style). Ran all 5 checks against the actual code, not just as prompts. Findings and fixes — full detail in `SECURITY.md`:

- **Unauthenticated draft-content disclosure** — `GET /api/projects`, `/api/blog` (list + `[id]`) defaulted to returning unpublished drafts to anyone unless the caller opted into `?published=true`. Nothing in the app itself even called these routes (both public site and dashboard query MongoDB directly in server components) — pure exposed attack surface. Fixed: unauthenticated/under-permissioned callers always get the published-only view now; single-item GET 404s an unpublished doc instead of exposing it (or even confirming it exists via a 403).
- **No security headers** — added CSP/HSTS/X-Frame-Options/etc. via `next.config.ts` `headers()`.
- **No rate limiting anywhere**, including login — added `lib/rateLimit.ts` (in-memory, documented caveat: per-warm-instance, not a hard global guarantee) wired into `authorize()`, `/api/contact`, `/api/quote`.
- **Every API route leaked `e.message` to the client** (43 occurrences across 21 files) — added `lib/apiError.ts`, bulk-migrated via a one-off Node script (see git history around this date if the pattern needs re-auditing).
- **Mongo operator-injection via mass assignment** — every PUT/POST spread the raw request body into a Mongoose write. Added `lib/sanitizeInput.ts`'s `stripOperatorKeys()`, applied across all internal write routes.
- **Public form mass-assignment** — `/api/contact` and `/api/quote` passed the whole body into `.create()`, letting an anonymous submitter set the staff-only `read` flag on their own submission. Fixed with explicit field whitelists.
- **`/api/setup/taxonomy`** (destructive one-time migration) had zero auth. Fixed: requires an administrator session now (unlike `/api/setup`, this isn't a pre-auth bootstrap step — an admin already has to exist to run it).
- **Unescaped user input in notification emails** — added `escapeHtml()` (`lib/utils.ts`).

Verified live: ran `npm run build` (clean) and briefly ran `npm run start` to confirm headers appear on a real response and the contact rate limiter actually 429s on the 6th request in a window — then deleted the 5 test `Contact` documents that test run wrote to the real Atlas database.

### 2026-08-23 — Homepage grid parity fix (services/work/blog)

`sahab-site/index.html`'s services/work/blog grids use `gap: 2px` — the gap *is* the visual seam between tiles (cards sit on `--surface` against `--bg`). The ported `globals.css` had all three at `gap: 12px` (a spacing-scale value), which wasn't a stylistic choice, it just narrowed every tile and killed the seam look. Also found: class renames during the port (`p-arrow`→`home-project-arrow`, `bc-img`→`home-blog-thumb`, etc.) had silently orphaned the original hover rules (`.project-card:hover h3{color:accent}`, image zoom on hover) — they were still written against the old class names, which no longer existed anywhere, so hover interactions on homepage project/blog cards did nothing but the lift. Fixed both; see `DESIGN.md § Grid & gap conventions` for the rule going forward, and don't reintroduce a spacing-scale gap on a seam grid.

### 2026-08-23 — About page: missing sections + broken skill-bar animation

Two separate bugs found by diffing `app/(site)/about/page.tsx` against `sahab-site/about.html`:

1. The "Info Grid" section (Role/Company/Experience/Location/Languages/Availability) and the CTA subtitle paragraph existed in the original template but were dropped entirely during the port. Re-added both; added the missing `.cta-sub` class to `globals.css` (it's a shared cta-section class, wasn't in there for *any* page, not just About).
2. Skill bars (`.skill-fill`) start at `width: 0` and only animate to their target width when a `.go` class is added — in the original site that came from a GSAP `ScrollTrigger` `onEnter` callback in `main.js`. Nothing in the React port ever added that class (`AnimatedSection` only handles fade/slide-in, not this), so every skill bar was permanently collapsed. Fixed by extracting a `SkillBar` component (`components/site/SkillBar.tsx`) using a plain `IntersectionObserver` to add `.go` on scroll-into-view — see `DESIGN.md § Animation system` for why this uses IntersectionObserver instead of GSAP.

### 2026-08-22 — Permissions system + content sanitization documented; WordPress-style roles added

Five-role system (`administrator/editor/author/contributor/subscriber`) added to `models/User.ts`, with `lib/permissions.ts` as the single source of truth (`can()`, `canWriteContent()`). Same day: testimonial card styling gap fixed, missing About section added to homepage, SCSS files fully centralized under `styles/` (no more colocated `.scss` next to `.tsx`).

### 2026-08-21 — `sanitize-html` replaced `isomorphic-dompurify`

`isomorphic-dompurify` pulls in `jsdom`, whose dependency chain has an ESM-only package that crashed with `ERR_REQUIRE_ESM` in Vercel's serverless runtime — regardless of bundler, so this wasn't a Turbopack-vs-webpack issue. `sanitize-html` has no `jsdom` dependency at all, which is why it replaced it rather than the crash being tuned around. See `lib/sanitize.ts`.

### 2026-08-17 — Turbopack disabled; production 500s fixed

Turbopack (Next 16's default) was crashing in production once it hit a `.scss` compile — fixed by forcing `--webpack` in both `package.json` scripts and `vercel.json`. This is why `CLAUDE.md` leads with a warning not to remove that flag without confirming the underlying Windows/Turbopack/Sass issue is fixed upstream.

### 2026-07-29 — Media library, Cloudinary upload, user roles (MongoDB) added

Foundational features: image upload via Cloudinary with a matching `Media` document per upload, first version of MongoDB-backed user roles, mobile responsive fixes, portfolio grid CSS fixes.

---

## How to use this file

- **Adding an entry**: newest at the top, dated (`YYYY-MM-DD`), one paragraph of *what changed and why* — not a restatement of the diff. If it's the kind of thing a future agent would otherwise burn tokens rediscovering by reading code, it belongs here.
- **This is not a substitute for `git log`** — skip entries for routine changes; only log the ones that carry a non-obvious decision, a bug with a non-obvious cause, or a convention someone might otherwise accidentally reverse.
- If an entry here contradicts what the code currently does, the code wins — update or remove the stale entry rather than leaving it misleading.
