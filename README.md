# Sahab Uddin Portfolio

Portfolio site and admin CMS for Sahab Uddin, freelance web developer.

Next.js 16 (App Router, webpack) · React 19 · MongoDB (Mongoose) · NextAuth v5 · Cloudinary · Resend · hosted on Vercel.

## Quick setup
1. Copy `.env.example` to `.env.local` and fill in the values (on Vercel, add them as environment variables).
2. `npm install`, then `npm run dev` (http://localhost:3000).
3. `POST /api/setup` once to create the first admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. Log in at `/dashboard`.

## Docs
- [CLAUDE.md](./CLAUDE.md): day-to-day conventions, commands and gotchas (start here)
- [docs/PRD.md](./docs/PRD.md): what the product is and what's in scope
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md): structure, data models, env vars, deployment
- [docs/RULES.md](./docs/RULES.md): how to write code that fits this codebase
- [docs/DESIGN.md](./docs/DESIGN.md): design tokens and styling rules
- [docs/SECURITY.md](./docs/SECURITY.md): security model and pre-ship checklist
- [docs/MEMORY.md](./docs/MEMORY.md): dated log of decisions and why
