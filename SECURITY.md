# Security

> What this app protects, how, and the checklist to follow before shipping anything new. Companion to [ARCHITECTURE.md](./ARCHITECTURE.md) (system structure) and [RULES.md](./RULES.md) (general engineering conventions).
>
> This file is written to double as the answer sheet for the "vibe-coding security prompts" checklist (Gitleaks / Bearer / production-audit / Trail-of-Bits-style / attacker's-perspective) — if you're asked to re-run that audit, diff this file against the current code instead of starting from zero.

## 1. Threat model

What's actually worth protecting here:

- **Dashboard access** — the CMS controls everything shown on the public site; an intruder who logs in can deface content, delete media, or read Contact/QuoteRequest submissions (PII: names, emails, project briefs).
- **Contact/QuoteRequest PII** — visitor-submitted emails, names, project details. Not payment data, not highly sensitive, but still personal data that should only be readable by staff.
- **Unpublished drafts** — a project or blog post not yet public shouldn't be discoverable by URL guessing before its intended release.
- **Cloudinary/Resend/MongoDB credentials** — server-side secrets; compromise means arbitrary image storage abuse, email sending as this domain, or full DB access.

Explicitly **not** in scope: payment fraud (no payments exist), multi-tenant isolation (single-tenant app), end-user account takeover (there are no end-user accounts, only staff).

## 2. Auth model

NextAuth v5 (`lib/auth.ts`), credentials-only provider, JWT session strategy (no DB session table).

- `authorize()` checks the `User` collection first (bcrypt-compared password, cost 12).
- Falls back to `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars **only if no matching `User` exists** — this is a bootstrap path for before the first real admin is created via `/api/setup`. That fallback session's `user.id` is the literal string `"env-admin"`, not a Mongoose ObjectId.
- Login is rate-limited: 5 attempts/minute/IP (`lib/rateLimit.ts`, wired into `authorize()`).
- `proxy.ts` wraps NextAuth's `auth` and gates `/dashboard/:path*` — logged-out users get redirected to `/login`. **API routes are not covered by this matcher** — each `app/api/**/route.ts` handler must do its own `await auth()` check. This is why the pattern in §4 matters: there is no middleware safety net for `/api/*`.

## 3. Authorization model

`lib/permissions.ts` is the single source of truth.

| Role | Can do |
|---|---|
| `administrator` | Everything (`['*']` short-circuits `can()`). |
| `editor` | Read/write projects, blog, testimonials, categories, tags, media; read contacts/quotes. Not users/settings. |
| `author` | Read/write **own** blog posts (`blog.write.own`); read projects/categories/tags/media, write media/tags. |
| `contributor` | Write **own blog drafts only** (`blog.write.own.draft`) — blocked from ever setting `published: true`, on create or edit. |
| `subscriber` | `read.only` — view-only dashboard access. |

- `can(role, action)` — the check nearly every route makes. A legacy `'admin'` role string aliases to `'administrator'` via `normalizeRole()` (pre-migration `User` docs still work).
- `canWriteContent(role, kind, {isOwner, publishing})` — ownership-aware, used only for `BlogPost` (the one model with an `author` field / role-dependent-on-ownership permission).
- Every API route follows the same shape: pull `role` off `session.user.role`, gate with `can()`/`canWriteContent()` **before** touching the database.

## 4. Implemented protections

Verified as of the 2026-08-23 audit (see `MEMORY.md` for the full narrative). Each of these is a concrete file to check before assuming it's still true:

| Protection | Where | Notes |
|---|---|---|
| Passwords hashed | `models/User.ts` | bcrypt, cost 12, `pre('save')` hook |
| Password never returned | `app/api/users/**` | `.select('-password')` everywhere |
| Security headers on every response | `next.config.ts` `headers()` | X-Content-Type-Options, X-Frame-Options: DENY, HSTS, Referrer-Policy, CSP |
| Rate limiting | `lib/rateLimit.ts` | login 5/min/IP; `/api/contact` + `/api/quote` 5/10min/IP |
| Safe error responses | `lib/apiError.ts` | Internal error detail logged server-side only; client gets a generic message (Mongoose ValidationError/CastError messages pass through — they're field-validation feedback, not a leak) |
| Draft/unpublished content locked down | `app/api/projects/**`, `app/api/blog/**` | Anonymous/unpermitted GETs always get `published: true` forced, regardless of query params; single-item GET 404s (not 403s) an unpublished doc to an unauthorized caller |
| Mongo operator-injection guard | `lib/sanitizeInput.ts` (`stripOperatorKeys`) | Applied to every PUT/POST that spreads a client JSON body into a Mongoose write (projects, blog, categories, tags, testimonials, settings, users) |
| Mass-assignment guard on public forms | `app/api/contact/route.ts`, `app/api/quote/route.ts` | Explicit field whitelist into `.create()` — an anonymous submitter can't set `read` on their own submission |
| Email HTML injection guard | same two files | `escapeHtml()` (`lib/utils.ts`) applied before interpolating submitter input into the Resend notification email |
| One-time migration endpoint locked down | `app/api/setup/taxonomy/route.ts` | Requires an administrator session (unlike `/api/setup`, this isn't a pre-auth bootstrap step) |
| Content XSS sanitization | `lib/sanitize.ts` (`sanitizeContent`) | `sanitize-html`-based allowlist tuned to the Quill editor's toolbar output; used on both `blog/[slug]` and `portfolio/[slug]` before `dangerouslySetInnerHTML` |
| Secrets hygiene | `.env*` gitignored, `.env.example` has placeholders only | Verified clean across full git history, not just current tree |
| DB transport security | `MONGODB_URI` uses `mongodb+srv://` | TLS enforced by the SRV connection form |

## 5. Known accepted risks / limitations

Deliberate trade-offs, not oversights — re-evaluate if the product's needs change:

- **Rate limiter is in-memory, per warm serverless instance.** Stops the common case (a script hammering one endpoint from one place); a distributed attacker across many cold-started Vercel instances could exceed the nominal limit. Upgrade path: swap `lib/rateLimit.ts`'s internals for `@upstash/ratelimit` (Redis-backed) without changing any call site.
- **SVG uploads are allowed** (`app/api/upload/route.ts`'s `allowed` mime list). SVGs can carry embedded scripts — a known stored-XSS vector if a raw Cloudinary SVG URL is opened directly (not via `<img>`, which doesn't execute embedded `<script>`). Kept because logo/favicon uploads may legitimately need SVG. If this ever becomes a concern, the fix is removing `image/svg+xml` from the allowlist — a one-line change, deliberately not made preemptively.
- **JWT sessions have no server-side revocation/blacklist.** Stateless JWT strategy means "logout" is client-side only; a stolen token remains valid until it expires. No infra exists today (Redis/DB session table) to blacklist on demand. Acceptable given the low-value target (staff dashboard, not a financial app) and short-lived nature of the risk window.
- **`/api/setup` is unauthenticated by necessity** — it's the pre-auth bootstrap path for creating the first admin account. It's self-limiting (no-ops the moment any `User` exists) and only ever creates the exact account your own env vars specify — an attacker calling it gains nothing they didn't already control.
- **No MFA.** Single-factor credentials login only. Reasonable for a solo/small-team CMS; revisit if the user base grows.

## 6. Secrets handling

- Never hardcode a secret in source — env vars only, checked in `.env.local` (gitignored), documented (placeholder only) in `.env.example`.
- Never prefix a sensitive var with `NEXT_PUBLIC_` — that prefix ships it to the browser bundle. Today only `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_SITE_NAME` use it, and neither is sensitive.
- If a secret is ever accidentally committed: rotating it is not optional — removing it from a future commit does not remove it from git history. Rotate at the provider (MongoDB Atlas, Resend, Cloudinary, or regenerate `AUTH_SECRET`) immediately, then scrub history if the repo is/becomes public.
- `console.log`/`console.error` must never print a credential, token, password, or full connection string. `lib/apiError.ts` centralizes error logging specifically so individual routes don't each decide what's safe to log.

## 7. Checklist for adding a new API route

Copy this when writing `app/api/<new-resource>/route.ts`:

- [ ] `await auth()` at the top of every handler that reads/writes non-public data — never rely on `proxy.ts` (it doesn't cover `/api/*`).
- [ ] Gate with `can(role, '<resource>.<read|write>')` or `canWriteContent()` — never trust a client-sent role/ownership claim.
- [ ] If the resource has a `published`/draft concept: unauthenticated or under-permissioned callers must always get the published-only view, regardless of query params the client sends.
- [ ] `const body = stripOperatorKeys(await req.json())` before passing `body` into any `create()`/`findByIdAndUpdate()` call — never spread a raw client body into a Mongoose write unless every field is meant to be publicly settable.
- [ ] On a public (unauthenticated) POST, whitelist accepted fields explicitly — don't pass `body` wholesale to `.create()`.
- [ ] Wrap the handler body in `try { ... } catch (e: any) { return apiError(e, '<label>') }` — never `return NextResponse.json({ error: e.message })` directly.
- [ ] If the route accepts unauthenticated POSTs (forms, webhooks): add `rateLimit()` (see `app/api/contact/route.ts` for the pattern).
- [ ] If the payload gets interpolated into an email/HTML template: `escapeHtml()` first.

## 8. Audit log

- **2026-08-23** — Full 5-check security audit (Gitleaks/Bearer/production-audit/Trail-of-Bits/attacker's-perspective style, per a "vibe-coding security prompts" checklist PDF). Found and fixed: unauthenticated draft-content disclosure on projects/blog GET routes, missing security headers, missing rate limiting (login + contact + quote), internal error-message leakage across all 21 API route files, Mongo operator-injection via mass-assigned request bodies, unauthenticated destructive `/api/setup/taxonomy` endpoint, unescaped user input in notification emails. Everything above in §4 reflects the post-fix state. Full narrative: `MEMORY.md`.
