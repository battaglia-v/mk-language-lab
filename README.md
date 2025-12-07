# Македонски • MK Language Lab 🇲🇰

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com)

Македонски • MK Language Lab is a modern, multilingual learning platform for Macedonian language learners. Built with Next.js 15 App Router, it features AI-powered conversations, interactive practice modules, translation tools, and curated news content.

## 🎯 Project Status

**Current Phase:** POC Development (Focus: Family Conversations)

See our [POC to Production Roadmap](docs/poc-production-roadmap.md) for the complete development plan.

## ✨ Key Features

- **🗣️ AI Tutor** - GPT-4 powered conversational practice with cultural context
- **📚 Interactive Practice** - Vocabulary exercises with instant feedback
- **🔄 Translation Tool** - Macedonian ↔ English translation powered by Google Cloud
- **📰 News Feed** - Curated Macedonian news articles for immersive learning
- **📸 Daily Lessons** - Instagram posts from @macedonianlanguagecorner integrated as learning content
- **🌍 Bilingual Interface** - Full English and Macedonian UI with `next-intl`
- **📱 Mobile-First Design** - Responsive design optimized for all devices
- **🎨 Modern UI** - Built with Tailwind CSS and shadcn/ui components

## 📊 Privacy-Friendly Analytics

The app uses Vercel Analytics to understand user behavior and improve the learning experience:

- **Privacy-First:** No cookies, fully GDPR compliant, anonymous tracking
- **Lightweight:** Minimal performance impact on the application
- **No PII:** No personally identifiable information is tracked

### Tracked Events

The app tracks the following key user interactions:
- Word of the Day views
- Quick Practice completions and accuracy
- Translation requests and copies
- News article and video clicks
- Sign-in events

### Viewing Analytics

Analytics data is available in the [Vercel Analytics Dashboard](https://vercel.com/docs/analytics):
1. Go to your Vercel project dashboard
2. Click on the "Analytics" tab
3. View page views, custom events, and user behavior

### Development Mode

In development, analytics events are logged to the console instead of being sent to Vercel. To enable analytics in development, set:

```bash
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- (Optional) Google Cloud account for translation API
- (Optional) OpenAI API key for tutor feature

### Installation

```bash
# Clone the repository
git clone https://github.com/battaglia-v/mk-language-lab.git
cd mk-language-lab

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env.local

# Initialize database
npx prisma migrate dev --name init

# Start development server
npm run dev
```

Visit http://localhost:3000/en (or /mk) to explore the app. Turbopack is enabled by default for fast reloads.

### Native Mobile (Expo)

The managed Expo app lives in `apps/mobile` so we can ship Android (and later iOS) from the same repo.

Before launching Expo:
- Copy `.env.local.example` → `.env.local` (root) and `apps/mobile/env.example` → `apps/mobile/.env`, then fill in `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_PROJECT_ID`, and `EXPO_PUBLIC_ENV`. During local development point `EXPO_PUBLIC_API_BASE_URL` at `http://localhost:3000`.
- Run the Next.js API locally via `npm run dev` so the Expo client can authenticate and fetch data.

Once env vars and the web server are ready:
1. Install web dependencies (`npm install`) plus the Expo ones (`cd apps/mobile && npm install`).
2. Start the Expo dev server from the repo root:
   - `npm run mobile:start` – QR code/dev menu
   - `npm run mobile:android` – boots Android emulator/device
   - `npm run mobile:ios` – boots iOS simulator (requires macOS/Xcode)
3. Sign-in runs through NextAuth + `expo-auth-session`: tap “Continue with browser” on the `/sign-in` screen, and the returned bearer token automatically unlocks push reminders + authenticated APIs.
4. Navigation is powered by `expo-router` (`apps/mobile/app/`), which currently exposes Home (mission preview), Practice, Discover, and Profile tabs that all reuse the shared Query Client/tokens.
5. Run `npm run test` to execute the shared Vitest suite plus the offline mobile smoke checks (mission/profile/practice fallbacks). Maestro flows live under `apps/mobile/tests/smoke.maestro.yml`; run them locally with `npm run mobile:test:maestro` (requires the Maestro CLI + a connected device/emulator).

### Shared Packages

- `packages/tokens` – single source of truth for Macedonian brand colors, spacing, radii, and typography scales (consumed by web + native).
- `packages/ui` – lightweight primitives (`WebButton`, `WebCard`, `WebStatPill`, `WebProgressRing`, plus the matching Native* variants) that wrap the token system for both platforms.
- `packages/api-client` – typed helpers and React Query hooks (`usePracticePromptsQuery`) that read from our Next.js APIs or fall back to bundled JSON during offline dev.

Import them via the `@mk/*` aliases defined in `tsconfig.json` to avoid brittle relative paths.

```tsx
// Web
import { WebProgressRing, WebStatPill } from '@mk/ui';
// Native
import { NativeProgressRing, NativeStatPill } from '@mk/ui';
// Data (shared)
import { usePracticePromptsQuery } from '@mk/api-client';
```

### Required Environment Variables

Create `.env.local` (not committed) with:

```
# Local development uses SQLite by default
DATABASE_URL="file:./dev.db"

# Google Cloud Translation API
GOOGLE_PROJECT_ID=<gcp-project-id>
GOOGLE_APPLICATION_CREDENTIALS=<absolute/path/to/service-account.json>
# or provide inline credentials:
# GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'

# Optional integrations
OPENAI_API_KEY=<openai-api-key>
GOOGLE_DOCS_ID=<google-docs-id>
DICTIONARY_PDF_URL=<dictionary-url>

# Instagram Integration (Daily Lessons)
# Set to "demo" to use mock data without Instagram API credentials
INSTAGRAM_ACCESS_TOKEN="demo"
INSTAGRAM_BUSINESS_ACCOUNT_ID=""

# Sentry Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-auth-token>
SENTRY_ORG=<sentry-org-slug>
SENTRY_PROJECT=<sentry-project-name>
```

> For detailed Sentry setup instructions, see [SENTRY_SETUP.md](SENTRY_SETUP.md)

Run `npx prisma migrate dev --name init` on first setup to create the SQLite database (stored at `prisma/dev.db`).

### Translation API
- The API route automatically detects credentials in three ways:
	- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: JSON or base64 JSON string (ideal for Vercel secrets).
	- `GOOGLE_APPLICATION_CREDENTIALS`: absolute file path to a service-account JSON (works locally).
	- No credentials → automatic mock mode with explanatory message in the JSON response.
- Ensure the service account has the "Cloud Translation API User" role and that the API is enabled in your project.

### Instagram Integration (Daily Lessons)

The app displays Instagram posts from [@macedonianlanguagecorner](https://www.instagram.com/macedonianlanguagecorner) as daily learning content.

**Quick Start (Demo Mode):**
- Works out of the box with mock data
- Set `INSTAGRAM_ACCESS_TOKEN="demo"` or leave empty
- No Instagram API setup required

**Production Setup (Real Instagram Posts):**
- Requires Instagram Business/Creator account
- Uses Instagram Graph API (free, official)
- Setup time: 30-60 minutes (one-time)
- See [INSTAGRAM_INTEGRATION.md](INSTAGRAM_INTEGRATION.md) for complete guide

**Features:**
- Displays posts in responsive grid (1/2/3 columns)
- Server-side caching (30-min TTL)
- Save posts to personal collection (requires auth)
- Filter by tags (vocabulary, grammar, culture, etc.)
- Graceful error handling and fallbacks

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest test suite
- `npm run test:watch` - Run tests in watch mode

## Preparing for Deployment

### Database (Production)
- Replace SQLite with a hosted Postgres instance (Vercel Postgres, Neon, Supabase, etc.).
- Update `.env.local` and Vercel environment settings with the Postgres connection string (`DATABASE_URL`).
- Run Prisma migrations against the production database before the first deployment: `DATABASE_URL=... npx prisma migrate deploy`.

### Environment Variables for Vercel
Add the following in your project settings:

```
DATABASE_URL
GOOGLE_PROJECT_ID
GOOGLE_APPLICATION_CREDENTIALS_JSON  # paste the service-account JSON or base64
OPENAI_API_KEY
GOOGLE_DOCS_ID
DICTIONARY_PDF_URL

# Instagram Integration (Optional - uses demo data by default)
INSTAGRAM_ACCESS_TOKEN
INSTAGRAM_BUSINESS_ACCOUNT_ID

# Sentry Error Tracking (Recommended for production)
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

> See [SENTRY_SETUP.md](SENTRY_SETUP.md) for complete Sentry configuration guide

#### Reminder Cron Secrets

- Generate a single `CRON_SECRET` value and add it to the Vercel project (**Settings → Environment Variables**) for the
  Production environment. Vercel's daily cron (configured in `vercel.json`) reads this token before invoking
  `/api/cron/reminders`.
- Mirror the exact same value in GitHub (**Settings → Secrets and variables → Actions**) as the `CRON_SECRET` repository
  secret and set `REMINDER_CRON_BASE_URL` to the production hostname. The fallback GitHub Actions smoke test validates the
  cron endpoint daily and now skips automatically when those protected secrets are unavailable.
- If either side is missing or mismatched, the reminder cron probe is skipped (non-production) or fails (production) so the
  protected endpoint is never pinged with invalid credentials.

### Deployment Workflow (Vercel)
1. Push the repository to GitHub/GitLab/Bitbucket.
2. Vercel dashboard → “New Project” → import the repo. Link it to the existing **mk-language-lab** project to avoid double deployments to multiple Vercel apps.
3. Configure env vars as above.
4. (Optional) Add a Postgres integration directly from Vercel to auto-provision `DATABASE_URL`.
5. Deploy – Vercel runs `npm install`, `prisma generate`, and `next build` automatically.
6. After the first deploy, run `npx prisma migrate deploy` (via Vercel CLI or locally against the production DB) to apply schema changes.
7. Smoke test the translation endpoint and the rest of the app on the deployed URL.

### Local Preview of Production Env

```
vercel env pull .env.production
npm install
npm run build
npm start
```

## 📚 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Database:** Prisma ORM (SQLite dev, PostgreSQL production)
- **AI/APIs:** OpenAI GPT-4o-mini, Google Cloud Translate
- **Localization:** next-intl
- **Testing:** Vitest, React Testing Library
- **Monitoring:** Sentry
- **Analytics:** Vercel Analytics (privacy-friendly, GDPR compliant)
- **Deployment:** Vercel

## 🗺️ Roadmap

See our complete [POC to Production Roadmap](docs/poc-production-roadmap.md) for detailed milestones:

- **✅ Phase 1:** MVP POC (Week 1-2) - Simplify to single learning path
- **📝 Phase 2:** Content Complete (Week 3-4) - 300+ vocabulary items
- **🏗️ Phase 3:** Production Infrastructure (Week 5-6) - Auth, monitoring, security
- **📱 Phase 4:** Android Release (Week 7-9) - PWA + Play Store _(paused; mobile shells retired Nov 2025)_
- **🍎 Phase 5:** iOS Release (Week 10-14) - Native wrapper _(paused; evaluate fresh approach before restarting)_

View all issues and progress on our [Project Board](https://github.com/users/battaglia-v/projects/2).

## 🤝 Contributing

Contributions are welcome! Please read the shared agent handbook in [`docs/agents/README.md`](docs/agents/README.md) before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/concepts/deployments/overview)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Google Cloud Translation](https://cloud.google.com/translate/docs)

## 💬 Support

For questions or support, please open an issue on GitHub or reach out to the maintainers.

---

**Made with ❤️ for Macedonian language learners**
# Test for QR
# Test2
# Test for QR code
# Force Redeploy
