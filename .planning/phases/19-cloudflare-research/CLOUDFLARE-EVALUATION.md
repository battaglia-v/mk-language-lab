# Cloudflare Pages/Workers Evaluation

**Evaluation Date:** 2026-01-09
**Project:** mk-language-lab
**Current Hosting:** Vercel
**Evaluated Alternative:** Cloudflare Pages with Workers

---

## Executive Summary

This evaluation assesses Cloudflare Pages/Workers as an alternative hosting platform for the mk-language-lab Next.js application. The analysis covers technical compatibility, feature support, database connectivity, and identifies blockers or required changes.

---

## 1. Technical Compatibility Analysis

### 1.1 Deployment Adapter Status

| Adapter | Version | Status | Notes |
|---------|---------|--------|-------|
| `@cloudflare/next-on-pages` | 1.13.16 | **DEPRECATED** | Archived Sept 2025, no longer maintained |
| `@opennextjs/cloudflare` | 1.14.8 | **Active** | Official recommended adapter |

**Recommendation:** Use `@opennextjs/cloudflare` adapter for any Cloudflare deployment.

### 1.2 Next.js Version Compatibility

| Next.js Version | Support Status | Notes |
|-----------------|----------------|-------|
| Next.js 14 (latest minor) | Supported | Full support |
| Next.js 15 (all minors) | Supported | Full support |
| **Next.js 16.0.10** | **NOT DOCUMENTED** | Current project version - compatibility unknown |

**BLOCKER:** The project uses Next.js 16.0.10, but OpenNext Cloudflare adapter only documents support for Next.js 14 and 15. Next.js 16 compatibility is not confirmed and would require testing or waiting for official support.

### 1.3 Feature Compatibility Matrix

| Feature | Vercel | Cloudflare | Status | Notes |
|---------|--------|------------|--------|-------|
| App Router | Yes | Yes | Compatible | Fully supported |
| Server Components | Yes | Yes | Compatible | SSG, SSR, PPR all supported |
| Route Handlers (API Routes) | Yes | Yes | Compatible | 36+ routes should work |
| Middleware | Yes | Partial | **LIMITATION** | Node Middleware (15.2+) not supported |
| ISR (Incremental Static Regeneration) | Yes | Yes | Compatible | Supported with configuration |
| Image Optimization | Yes | Partial | **REQUIRES CHANGE** | Needs Cloudflare Images integration |
| Server Actions | Yes | Yes | Compatible | Supported |
| Static Export | Yes | Yes | Compatible | Full support |
| Edge Runtime | Yes | Yes | Compatible | Native to Workers |

### 1.4 Worker Size Limits

| Plan | Compressed Size Limit | Impact |
|------|----------------------|--------|
| Free | 3 MiB | May be restrictive for large apps |
| Paid | 10 MiB | Should accommodate most Next.js apps |

**Note:** Bundle size needs verification after build to ensure compliance.

---

## 2. Database & ORM Compatibility

### 2.1 Prisma on Cloudflare Workers

| Aspect | Status | Notes |
|--------|--------|-------|
| Prisma ORM | **Preview** | Edge deployment is Preview status |
| Prisma Client JS | Supported | Requires `engineType = "client"` config |
| Query Engine | **Not Available** | Rust binary engine doesn't run on Workers |
| Driver Adapters | Required | Must use HTTP-based adapters |

**Required Prisma Schema Changes:**
```prisma
generator client {
  provider   = "prisma-client-js"
  engineType = "client"  // Required for edge
}
```

### 2.2 Neon PostgreSQL Compatibility

| Aspect | Status | Notes |
|--------|--------|-------|
| Neon Serverless Driver | Compatible | Uses HTTP/WebSocket, works on Workers |
| `@prisma/adapter-neon` | Available | v6.16.0+, project uses Prisma 6.19 |
| Connection Pooling | Yes | PgBouncer with up to 10,000 connections |
| Cold Start | **Consideration** | 500ms to few seconds activation time |

**Required Driver Installation:**
```bash
npm install @prisma/adapter-neon @neondatabase/serverless
```

**Code Changes Required:**
```typescript
// lib/prisma.ts - Edge-compatible version
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

neonConfig.fetchConnectionCache = true

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })
```

### 2.3 Database Connectivity Summary

| Current Setup | Cloudflare Requirement | Effort |
|---------------|----------------------|--------|
| Prisma with standard driver | Prisma with Neon adapter | Medium |
| `DATABASE_URL` connection | HTTP-based connection | Config change |
| Connection pooling via Neon | Native support via driver | Compatible |

---

## 3. Integration Compatibility

### 3.1 Authentication (NextAuth v5)

| Component | Cloudflare Compatibility | Notes |
|-----------|-------------------------|-------|
| NextAuth v5 beta | **Unknown** | Not tested on Workers edge runtime |
| Prisma Adapter | Requires adapter change | Must use edge-compatible Prisma |
| OAuth Providers | Should work | Google, Facebook OAuth unchanged |
| Session Management | **Needs Testing** | JWT-based should work |

**Risk:** NextAuth v5 beta on Cloudflare Workers is not well documented.

### 3.2 External API Integrations

| Integration | Cloudflare Compatibility | Notes |
|-------------|-------------------------|-------|
| OpenAI API | Compatible | HTTP-based API calls |
| Google Cloud Translation | Compatible | HTTP-based API calls |
| Google Cloud TTS | Compatible | HTTP-based API calls |
| Resend (Email) | Compatible | HTTP-based API calls |
| Instagram Graph API | Compatible | HTTP-based API calls |

### 3.3 Infrastructure Services

| Service | Cloudflare Compatibility | Notes |
|---------|-------------------------|-------|
| Upstash Redis | Compatible | Uses REST API, edge-native |
| AWS S3 / R2 | Compatible | R2 is S3-compatible, better integration |
| Sentry | Compatible | Has Cloudflare Workers SDK |
| Vercel Analytics | **NOT COMPATIBLE** | Must switch to CF Web Analytics |

**Required Changes:**
- Replace `@vercel/analytics` with Cloudflare Web Analytics
- Update Sentry config for Workers environment

### 3.4 Internationalization (next-intl)

| Aspect | Status | Notes |
|--------|--------|-------|
| next-intl 4.5.7 | Should work | Standard i18n, no special runtime needs |
| Message files | Compatible | Static JSON files work on any platform |
| Locale routing | Compatible | App Router i18n routing supported |

---

## 4. Known Blockers & Limitations

### 4.1 Critical Blockers

| Blocker | Severity | Impact | Mitigation |
|---------|----------|--------|------------|
| Next.js 16 not documented | **HIGH** | May not work at all | Wait for adapter update or downgrade |
| Node Middleware (15.2+) | MEDIUM | If using this feature | Check if used; may need alternatives |
| Prisma Preview status | MEDIUM | Potential instability | Accept risk or use raw SQL |

### 4.2 Required Code Changes Summary

| Area | Change Required | Effort |
|------|----------------|--------|
| Prisma configuration | Add `engineType = "client"` | Low |
| Prisma client setup | Use Neon adapter | Medium |
| Analytics | Switch to CF Web Analytics | Low |
| Image optimization | Configure CF Images | Low |
| Environment variables | Update for Workers | Low |
| Build configuration | Add `@opennextjs/cloudflare` | Low |

### 4.3 Development Environment Considerations

| Aspect | Impact |
|--------|--------|
| Windows support | Limited - WSL recommended |
| Local development | Need Wrangler for Workers emulation |
| Testing | May need different local/prod configs |

---

## 5. Migration Effort Estimate

### 5.1 Code Changes

| Category | Files Affected | Estimated Hours |
|----------|---------------|-----------------|
| Prisma configuration | 2-3 files | 2-4 hours |
| Analytics switch | 1-2 files | 1-2 hours |
| Build configuration | 2-3 files | 2-4 hours |
| Image optimization | 1-2 files | 1-2 hours |
| Environment updates | .env files | 1 hour |
| **Total estimate** | **8-12 files** | **8-16 hours** |

### 5.2 Testing Requirements

| Test Type | Scope | Estimated Hours |
|-----------|-------|-----------------|
| Local development testing | All features | 4-8 hours |
| Staging deployment | Full app | 4-8 hours |
| Authentication flows | NextAuth | 2-4 hours |
| Database operations | All Prisma queries | 2-4 hours |
| API route testing | 36+ routes | 4-8 hours |
| **Total testing** | | **16-32 hours** |

### 5.3 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Next.js 16 incompatibility | HIGH | Critical | Version pin or wait |
| NextAuth edge issues | MEDIUM | High | Extensive testing |
| Prisma edge bugs | MEDIUM | Medium | Fallback plans |
| Performance regression | LOW | Medium | Monitoring |

---

## 6. Next Steps (If Proceeding)

### 6.1 Prerequisites Before Migration

1. **Verify Next.js 16 support** - Contact OpenNext team or test locally
2. **Test NextAuth on Workers** - Create PoC for auth flows
3. **Benchmark Prisma edge performance** - Compare to current latency
4. **Audit bundle size** - Ensure < 10 MiB compressed

### 6.2 Migration Checklist (Phase 20)

- [ ] Update Prisma schema for edge
- [ ] Install and configure Neon adapter
- [ ] Replace Vercel Analytics with CF Web Analytics
- [ ] Configure Cloudflare Images for next/image
- [ ] Add `@opennextjs/cloudflare` to project
- [ ] Update wrangler.toml configuration
- [ ] Test all API routes
- [ ] Test authentication flows
- [ ] Test database operations
- [ ] Verify i18n functionality
- [ ] Performance benchmarking
- [ ] Staging deployment
- [ ] Production cutover plan

---

*Document created: 2026-01-09*
*Last updated: 2026-01-09*
