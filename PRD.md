# PRD — Sahab Uddin Mintu Portfolio + CMS

> What this product is, for whom, and what "done" looks like. For *how it's built*, see [ARCHITECTURE.md](./ARCHITECTURE.md); for *how to build in it*, see [RULES.md](./RULES.md).

## 1. Product summary

A single Next.js deployment serving two audiences:

1. **Public portfolio site** — Sahab Uddin Mintu's freelance developer portfolio (WordPress/Webflow/MERN work), used to win freelance/contract work and let clients contact him.
2. **Dashboard CMS** — a WordPress-style admin panel behind `/dashboard`, used to manage every piece of content on the public site (projects, blog, testimonials, media, site settings, users) without touching code.

One codebase, one database, one deploy — not two products.

## 2. Goals

- Convert site visitors into client inquiries (contact form, quote request, portfolio credibility).
- Let Sahab (and eventually other content staff) publish/edit content without a developer.
- Support role-based collaboration (see §3) so future writers/contributors can be added without giving them full admin access.
- Stay fast, accessible, and SEO-indexable as a portfolio site depends on organic discovery.

## 3. Users & roles

| User | What they do |
|---|---|
| **Site visitor** | Browses portfolio/blog, submits the contact form or a quote request. Anonymous, no account. |
| **Administrator** | Full access — content, users, settings. Currently: Sahab. |
| **Editor** | Manages all content (projects, blog, testimonials, taxonomy, media) but not users/settings. |
| **Author** | Writes and publishes their *own* blog posts; can't touch projects/categories. |
| **Contributor** | Writes blog drafts only — an editor/admin must publish. |
| **Subscriber** | View-only dashboard access. |

Full permission matrix: [`lib/permissions.ts`](./lib/permissions.ts), documented in [SECURITY.md](./SECURITY.md#authorization-model).

## 4. Public site — features

| Page | Purpose |
|---|---|
| `/` | Hero, stats, about teaser, services ("What I Do"), selected work, testimonials slider, latest blog posts, CTA. |
| `/about` | Full story, experience timeline, skills (animated bars), info grid. |
| `/portfolio` + `/portfolio/[slug]` | Filterable project grid; full case-study page per project (gallery, stack, links). |
| `/blog` + `/blog/[slug]` | List + full article (rich-text content, sanitized HTML). |
| `/contact` | Contact form → `Contact` document + email notification via Resend. |
| `/get-quote` | Multi-field quote request form → `QuoteRequest` document + email notification. |

Shared: dark/light theme toggle, responsive nav, footer with dynamic menus/social links.

## 5. Dashboard CMS — features

- **Content CRUD**: Projects, Blog posts (with categories/tags, rich-text editor, image/gallery upload).
- **Taxonomy**: shared Category/Tag system (`type: 'project' | 'blog'`), hierarchical categories.
- **Media Library**: every upload becomes a browsable `Media` document; usage-checked deletion (can't delete an image still referenced by a project/post/testimonial).
- **Testimonials**: manage client reviews shown in the homepage slider.
- **Inbox**: Contacts and Quote Requests submitted from the public site, read-tracked.
- **Site Settings**: profile identity, header/footer menus, social links, hero stats, footer copy — one document, six-tab dashboard UI.
- **Users**: role-based staff accounts (administrator/editor/author/contributor/subscriber).

## 6. Content model overview

Full field-level schema reference: [ARCHITECTURE.md § Data models](./ARCHITECTURE.md#data-models). Summary: `Project`, `BlogPost`, `Category`, `Tag`, `Testimonial`, `Contact`, `QuoteRequest`, `SiteSettings`, `User`, `Media`.

## 7. Non-goals / out of scope

- **No payments.** Nothing in this app processes money — quote requests are informational, not checkout.
- **No multi-tenant / multi-site.** One `SiteSettings` document, one owner brand.
- **No public API.** `/api/*` exists solely to back the dashboard UI, not for third-party consumption (no API keys, no public docs, CORS is same-origin only by design).
- **No end-user accounts.** `User` = staff/dashboard accounts only; site visitors never sign up or log in.

## 8. Known gaps / candidate roadmap

Not commitments — things noticed while working in the codebase that would be reasonable next steps if the product's needs grow:

- No self-service password reset flow (an admin resets a user's password manually via `/dashboard/users`).
- `BlogPost` has no `noIndex` field (Project does) — can't hide an individual post from search engines yet.
- `Testimonial` has no moderation/approval flag — anything created shows in the public slider once `featured: true`.
- Rate limiting is in-memory/per-instance (see [SECURITY.md](./SECURITY.md#known-accepted-risks--limitations)) — fine at current traffic, would need a shared store (Upstash Redis) if traffic or attack surface grows.
- No automated test suite (`CLAUDE.md` already notes this — `npx tsc --noEmit` is the only automated check today).

## 9. Success metrics

Informal (no analytics wired in as of this writing): contact/quote submissions received, portfolio case studies published, Lighthouse/PageSpeed score on public pages, and — the actual point of the site — freelance leads converted.
