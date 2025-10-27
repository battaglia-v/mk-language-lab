# Deployment Guide

> **Last Updated**: 2025-10-27  > **Owner**: Vincent Battaglia  > **Review Cycle**: Monthly

This guide documents how we deploy MK Language Lab to Vercel and manage environment secrets.

## Environments

| Environment | Branch | Notes |
| --- | --- | --- |
| Preview | PR branches | Auto-created by Vercel for every pull request. |
| Staging | `main` | Used for final QA before production release. |
| Production | `main` (promoted) | Vercel production deployment. |

## Deployment Steps

1. Merge PRs into `main`; Vercel builds and deploys to Staging automatically.
2. Verify smoke tests in the Staging preview (`https://mk-language-lab-git-main-*.vercel.app`).
3. Promote the Staging deployment to Production via Vercel dashboard or CLI (`vercel promote`).
4. Monitor the deployment for errors (Vercel Analytics, logs).

## Environment Variables

| Variable | Purpose | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Prisma connection string | Required for tasks and future tutor persistence. |
| `GOOGLE_PROJECT_ID` | Google Translate project | Must align with credentials JSON or key file. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key (server runtime) | Optional when using JSON inline. |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Base64/JSON credentials blob | Use for serverless deployment. |
| `OPENAI_API_KEY` | Tutor chat integration | Optional; absence triggers mock responses. |
| `NEXT_PUBLIC_ENABLE_TUTOR_CHAT` | Feature flag | Controls visibility of the tutor UI. |

Store secrets in Vercel project settings; avoid committing `.env` files to the repository.

## Prisma Migrations

1. Update `prisma/schema.prisma`.
2. Run `pnpm prisma migrate dev --name <migration-name>` locally.
3. Commit migration files and regenerate the Prisma client (`pnpm prisma generate`).
4. On deploy, ensure `prisma migrate deploy` runs (configured in Vercel Build Command or via `postinstall`).

## Rollback Procedure

- Use Vercel’s deployment history to roll back to the last known good version (`vercel rollback <deployment-url>`).
- Coordinate database rollbacks separately; Prisma migrations may require manual intervention.

## Monitoring & Alerts

- Enable Vercel logs aggregation or connect to Logflare/DataDog (TODO).
- Track external API quotas (Google Translate, OpenAI) via provider dashboards.
