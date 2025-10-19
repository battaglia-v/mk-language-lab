## Macedonian Learning App

This repository contains a full-stack Macedonian language learning platform built with the Next.js App Router, Tailwind CSS (neon-dark theme), `next-intl` localization, and Prisma ORM. It includes interactive lessons, an AI tutor interface, a translation tool, a Kanban-style task board, resource browsers, and locale-aware navigation.

### Key Features
- Locale-prefixed routing with English and Macedonian translations via `next-intl`
- Session-free experience – all tools are available instantly without sign-in
- AI tutor mock endpoint, translation tool with Google Cloud fallback, PDF resource viewer
- Drag-and-drop Kanban task manager (dnd-kit) with localStorage persistence
- Tailwind + shadcn/ui component library and dark neon theming

## Development Setup

```bash
npm install
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

## Testing & Tooling

- `npm run lint` – ESLint across the project
- `npm run build` – production build (Turbopack)

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

## Useful Links
- Next.js App Router docs: https://nextjs.org/docs/app
- Prisma docs: https://www.prisma.io/docs
- Vercel deployment guides: https://vercel.com/docs/concepts/deployments/overview
