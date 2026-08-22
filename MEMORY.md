# Memory — decision & change log

> Reverse-chronological log of significant fixes and decisions, with the *why* — so a new agent (or future-you) understands why the code looks the way it does instead of re-discovering it from the diff. Not a full commit log (`git log` already has that) — only entries that carry a decision or a lesson. Add an entry here whenever you make a change another agent would otherwise waste tokens re-deriving.
>
> For the current state of things (not the history), see [ARCHITECTURE.md](./ARCHITECTURE.md), [SECURITY.md](./SECURITY.md), [DESIGN.md](./DESIGN.md), [RULES.md](./RULES.md).

---

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
