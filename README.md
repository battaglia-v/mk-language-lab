# MK Language Lab 🇲🇰

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com)

A modern, multilingual learning platform for Macedonian language learners. Built with Next.js 15 App Router, featuring AI-powered conversations, interactive practice modules, translation tools, and curated news content.

## 🎯 Project Status

**Current Phase:** POC Development (Focus: Family Conversations)

See our [POC to Production Roadmap](docs/poc-production-roadmap.md) for the complete development plan.

## ✨ Key Features

- **🗣️ AI Tutor** - GPT-4 powered conversational practice with cultural context
- **📚 Interactive Practice** - Vocabulary exercises with instant feedback
- **🔄 Translation Tool** - Macedonian ↔ English translation powered by Google Cloud
- **📰 News Feed** - Curated Macedonian news articles for immersive learning
- **🌍 Bilingual Interface** - Full English and Macedonian UI with `next-intl`
- **📱 Mobile-First Design** - Responsive design optimized for all devices
- **🎨 Modern UI** - Built with Tailwind CSS and shadcn/ui components

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
```

Run `npx prisma migrate dev --name init` on first setup to create the SQLite database (stored at `prisma/dev.db`).

### Translation API
- The API route automatically detects credentials in three ways:
	- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: JSON or base64 JSON string (ideal for Vercel secrets).
	- `GOOGLE_APPLICATION_CREDENTIALS`: absolute file path to a service-account JSON (works locally).
	- No credentials → automatic mock mode with explanatory message in the JSON response.
- Ensure the service account has the “Cloud Translation API User” role and that the API is enabled in your project.

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
```

### Deployment Workflow (Vercel)
1. Push the repository to GitHub/GitLab/Bitbucket.
2. Vercel dashboard → “New Project” → import the repo.
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
- **Deployment:** Vercel

## 🗺️ Roadmap

See our complete [POC to Production Roadmap](docs/poc-production-roadmap.md) for detailed milestones:

- **✅ Phase 1:** MVP POC (Week 1-2) - Simplify to single learning path
- **📝 Phase 2:** Content Complete (Week 3-4) - 300+ vocabulary items
- **🏗️ Phase 3:** Production Infrastructure (Week 5-6) - Auth, monitoring, security
- **📱 Phase 4:** Android Release (Week 7-9) - PWA + Play Store
- **🍎 Phase 5:** iOS Release (Week 10-14) - Capacitor + App Store

View all issues and progress on our [Project Board](https://github.com/users/battaglia-v/projects/2).

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

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
