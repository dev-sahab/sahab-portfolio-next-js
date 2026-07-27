# Sahab Dev Portfolio — Next.js 15 + MongoDB + Dashboard

Full-stack portfolio with admin dashboard built with Next.js 15, TypeScript, MongoDB Atlas, and NextAuth v5.

## 🚀 Quick Deploy to Vercel

### 1. MongoDB Atlas (free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a **free M0** cluster
3. Create a database user (Settings → Database Access)
4. Whitelist `0.0.0.0/0` (Network Access → Add IP Address → Allow from anywhere)
5. Get connection string: Connect → Drivers → Copy URI
6. Replace `<password>` with your actual password

### 2. Resend Email (free 3000/month)
1. Go to [resend.com](https://resend.com) → Create account
2. Add your domain (or use `onboarding@resend.dev` for testing)
3. Create API key → copy it

### 3. Deploy to Vercel
```bash
# Option A: CLI
npm install -g vercel
vercel --prod

# Option B: GitHub
# Push to GitHub → vercel.com → Import → Add env vars
```

### 4. Environment Variables (add in Vercel dashboard)
```
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://yourdomain.vercel.app
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your-secure-password
RESEND_API_KEY=re_xxxxx
RESEND_FROM=noreply@yourdomain.com
RESEND_TO=frshahab.me@gmail.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
```

### 5. First Login
- Visit `https://yourdomain.vercel.app/dashboard`
- Login with `ADMIN_EMAIL` + `ADMIN_PASSWORD` from env vars
- Go to **Settings** and fill in your profile info
- Add projects, blog posts, testimonials from the dashboard

## 🏗 Local Development
```bash
cp .env.example .env.local
# Fill in all values

npm install
npm run dev
# → http://localhost:3000        (portfolio)
# → http://localhost:3000/dashboard  (admin)
```

## 📁 Structure
```
app/
├── (site)/          # Public portfolio pages
│   ├── page.tsx     # Home
│   ├── about/
│   ├── portfolio/[slug]/
│   ├── blog/[slug]/
│   ├── contact/
│   └── get-quote/
├── (dashboard)/     # Admin (protected)
│   └── dashboard/
│       ├── projects/
│       ├── blog/
│       ├── testimonials/
│       ├── contacts/
│       ├── quotes/
│       └── settings/
├── api/             # REST endpoints
│   ├── projects/
│   ├── blog/
│   ├── testimonials/
│   ├── settings/
│   ├── contact/
│   └── quote/
components/
├── site/            # Portfolio components
└── dashboard/       # Admin components
models/              # Mongoose schemas
lib/                 # MongoDB + Auth + Utils
```

## ✅ Features
- **Dashboard** — CRUD for Projects, Blog, Testimonials, Settings
- **Contact inbox** — All form submissions visible in dashboard
- **Quote requests** — Conditional form fields + timeline calculator + saved to DB
- **Email notifications** — Via Resend when contact/quote arrives
- **Dark/Light mode** — Persisted to localStorage
- **Cursor** — Light-mode fix (GSAP controls size, no CSS transition conflict; mix-blend-mode:normal on light bg)
- **SEO** — generateMetadata on every page
- **Animations** — GSAP loaded client-side only (no SSR issues)
- **Auth** — NextAuth v5 credentials, JWT session, middleware-protected dashboard

## 🔧 Customization
All site data flows from MongoDB Settings document — edit via `/dashboard/settings`.
No rebuild needed for content changes.
