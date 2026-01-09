# Cloudflare Pages/Workers Evaluation

**Evaluation Date:** 2026-01-09
**Project:** mk-language-lab
**Current Hosting:** Vercel
**Evaluated Alternative:** Cloudflare Pages with Workers

---

## Executive Summary

This evaluation assesses Cloudflare Pages/Workers as an alternative hosting platform for the mk-language-lab Next.js application. The analysis covers technical compatibility, feature support, database connectivity, and identifies blockers or required changes.

**Verdict: NO-GO (DEFER)**

| Aspect | Finding |
|--------|---------|
| Technical Compatibility | BLOCKED - Next.js 16 not supported |
| Cost Savings | ~$19/month (~$228/year) |
| Migration Effort | 40+ hours |
| ROI Payback | 13+ years |
| Recommendation | Stay on Vercel, re-evaluate when conditions change |

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

## 5. Cost Comparison Analysis

### 5.1 Platform Pricing Overview

#### Vercel Pricing (Pro Plan - $20/month base)

| Resource | Included | Overage |
|----------|----------|---------|
| Edge Requests | 10M/month | $2 per 1M |
| Fast Data Transfer | 1TB/month | $0.15/GB |
| Function Invocations | Included in $20 | $0.60 per 1M |
| Active CPU | Included in $20 | $0.128/hour |
| Build Minutes | Varies | $0.014-$0.126/min |
| Image Optimization | Included | Usage-based |
| Web Analytics | 50K events/month | $3 per 100K events |

#### Cloudflare Pricing (Workers Paid - $5/month base)

| Resource | Included | Overage |
|----------|----------|---------|
| Workers Requests | 10M/month | $0.30 per 1M |
| CPU Milliseconds | 30M/month | $0.02 per 1M ms |
| Static Assets | **Unlimited** | Free |
| Bandwidth/Egress | **Unlimited** | Free |
| Build Minutes | 500/month (Pages) | Additional at cost |
| Image Optimization | Separate service | Usage-based |
| Web Analytics | **Unlimited** | Free |

### 5.2 Estimated Monthly Cost Comparison

Based on a small-to-medium language learning app with typical usage:

**Assumed Usage Profile:**
- Monthly page views: ~50,000
- API requests: ~200,000/month
- Function invocations: ~500,000/month
- Average CPU per request: ~20ms
- Bandwidth: ~50GB/month
- Build frequency: ~30 builds/month (~5 min each)
- Image optimizations: ~10,000/month

| Cost Category | Vercel Pro | Cloudflare | Savings |
|---------------|------------|------------|---------|
| **Base Plan** | $20/month | $5/month | $15/month |
| **Compute** | Included | Included | - |
| **Bandwidth** | Included | Free | - |
| **Analytics** | ~$1.50/month | Free | $1.50/month |
| **Builds** | ~$2/month | Included | $2/month |
| **Total Estimated** | **~$24/month** | **~$5/month** | **~$19/month** |
| **Annual Savings** | - | - | **~$228/year** |

### 5.3 Cost Comparison at Scale

For higher traffic scenarios:

| Monthly Traffic | Vercel Pro | Cloudflare | Savings |
|-----------------|------------|------------|---------|
| 100K requests | ~$25 | ~$5 | $20 (80%) |
| 1M requests | ~$35 | ~$5 | $30 (86%) |
| 10M requests | ~$60 | ~$5 | $55 (92%) |
| 50M requests | ~$120+ | ~$17 | $103+ (86%) |

**Key Cost Advantages of Cloudflare:**
- **Free egress bandwidth** - No data transfer costs
- **Free static assets** - Unlimited static file serving
- **Free analytics** - No per-event charges
- **Lower base price** - $5 vs $20/month

### 5.4 Additional Service Costs

#### Image Storage (S3 vs R2)

| Aspect | AWS S3 | Cloudflare R2 | Notes |
|--------|--------|---------------|-------|
| Storage | $0.023/GB | $0.015/GB | R2 35% cheaper |
| Egress | $0.09/GB | **Free** | Major savings |
| Requests | $0.0004/1K | $0.36/1M | Similar |

**R2 Potential Savings:** If serving 100GB/month of images, R2 saves ~$9/month in egress alone.

#### Database (Neon)

No change in database costs - Neon PostgreSQL pricing remains the same regardless of hosting platform.

#### Monitoring (Sentry)

No change - Sentry pricing is independent of hosting platform.

### 5.5 Hidden Costs to Consider

| Factor | Vercel | Cloudflare | Notes |
|--------|--------|------------|-------|
| Migration effort | N/A | 24-48 hours | One-time dev cost |
| Learning curve | None | Medium | Team ramp-up time |
| Debugging complexity | Low | Higher | Less familiar tooling |
| Support quality | Excellent | Good | Vercel has better Next.js support |
| Incident risk | Low | Medium | New platform risks |

### 5.6 Break-Even Analysis

**Migration investment:** ~40 hours of development time

Assuming developer cost of $75/hour:
- Migration cost: ~$3,000 one-time

**Payback period at current scale:**
- Monthly savings: ~$19/month
- Payback: ~158 months (13+ years)

**At higher scale (1M+ requests):**
- Monthly savings: ~$30/month
- Payback: ~100 months (8+ years)

**Conclusion:** Cost savings alone do not justify migration at current scale. Other factors (performance, features, vendor diversification) would need to drive the decision.

---

## 6. Migration Effort Estimate

### 6.1 Code Changes

| Category | Files Affected | Estimated Hours |
|----------|---------------|-----------------|
| Prisma configuration | 2-3 files | 2-4 hours |
| Analytics switch | 1-2 files | 1-2 hours |
| Build configuration | 2-3 files | 2-4 hours |
| Image optimization | 1-2 files | 1-2 hours |
| Environment updates | .env files | 1 hour |
| **Total estimate** | **8-12 files** | **8-16 hours** |

### 6.2 Testing Requirements

| Test Type | Scope | Estimated Hours |
|-----------|-------|-----------------|
| Local development testing | All features | 4-8 hours |
| Staging deployment | Full app | 4-8 hours |
| Authentication flows | NextAuth | 2-4 hours |
| Database operations | All Prisma queries | 2-4 hours |
| API route testing | 36+ routes | 4-8 hours |
| **Total testing** | | **16-32 hours** |

### 6.3 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Next.js 16 incompatibility | HIGH | Critical | Version pin or wait |
| NextAuth edge issues | MEDIUM | High | Extensive testing |
| Prisma edge bugs | MEDIUM | Medium | Fallback plans |
| Performance regression | LOW | Medium | Monitoring |

---

## 7. Go/No-Go Recommendation

### 7.1 Feasibility Assessment

| Dimension | Assessment | Details |
|-----------|------------|---------|
| **Technical** | **BLOCKED** | Next.js 16 not supported by OpenNext adapter |
| **Effort** | HIGH | 24-48 hours dev + testing for uncertain outcome |
| **Risk** | HIGH | Multiple Preview/beta components (Prisma edge, NextAuth) |
| **Benefit** | LOW | ~$19/month savings, 13+ year payback |

### 7.2 Decision Matrix

| Factor | Weight | Vercel | Cloudflare | Winner |
|--------|--------|--------|------------|--------|
| **Cost** | Medium | $24/mo | $5/mo | Cloudflare |
| **Developer Experience** | High | Excellent | Good | Vercel |
| **Next.js Support** | Critical | Native | Via adapter | Vercel |
| **Version Compatibility** | Critical | All versions | v14-15 only | Vercel |
| **Prisma Support** | High | Full | Preview/Edge | Vercel |
| **Performance** | Medium | Excellent | Excellent | Tie |
| **Reliability** | High | Proven | Proven | Tie |
| **Vendor Lock-in** | Low | Medium | Low | Cloudflare |
| **Migration Effort** | High | None | 40+ hours | Vercel |

**Weighted Score:**
- Vercel: Wins on 5/9 factors, ties on 2
- Cloudflare: Wins on 2/9 factors, ties on 2

### 7.3 Critical Blockers Summary

1. **Next.js 16 Not Supported** - The project uses Next.js 16.0.10, but OpenNext Cloudflare adapter only documents support for v14-15. This is a hard blocker until adapter is updated.

2. **Prisma Edge is Preview** - Running Prisma on Cloudflare Workers is in Preview status with potential instability and missing features.

3. **NextAuth v5 Untested** - NextAuth v5 beta on Cloudflare Workers is not documented or tested, creating significant auth risk.

4. **ROI is Negative** - At current scale, 13+ year payback period means migration cost exceeds lifetime savings.

### 7.4 Recommendation

## **NO-GO** (with DEFER condition)

**Rationale:**
The combination of:
- Hard blocker (Next.js 16 not supported)
- Multiple technical risks (Prisma Preview, NextAuth untested)
- Negative ROI at current scale
- High migration effort for uncertain outcome

...makes Cloudflare migration inadvisable at this time.

### 7.5 Conditions for Re-Evaluation

Re-evaluate Cloudflare migration when ANY of these conditions are met:

| Condition | Trigger | Priority |
|-----------|---------|----------|
| Next.js 16 support added | OpenNext adapter v2.0+ releases | HIGH |
| Traffic scales 10x | Monthly requests > 5M | MEDIUM |
| Vercel costs spike | Monthly bill > $100 | MEDIUM |
| Prisma edge goes GA | Prisma announces stable edge | LOW |
| Vendor diversification needed | Strategic decision | LOW |

### 7.6 Recommended Actions

**Immediate (v1.2):**
1. Document this evaluation for future reference
2. Close Cloudflare research - no further action needed
3. Continue with Vercel deployment
4. Monitor OpenNext releases for Next.js 16 support

**Future (v1.3+, if conditions change):**
1. Create PoC branch to test Next.js on Cloudflare
2. Test NextAuth on Workers runtime
3. Benchmark Prisma edge performance
4. Re-run cost analysis with actual traffic data

### 7.7 Alternative Cost Optimizations

Instead of platform migration, consider these lower-effort optimizations:

| Optimization | Effort | Potential Savings |
|--------------|--------|-------------------|
| Downgrade to Vercel Hobby | None | $20/month |
| Optimize function execution time | Low | Variable |
| Add aggressive caching | Medium | Reduce function calls |
| Migrate images to R2 (S3-compatible) | Low | ~$9/month on egress |
| Review API rate limits | Low | Reduce abuse costs |

**Note:** The project may already be eligible for Vercel Hobby tier if traffic is low enough.

---

## 8. Next Steps (If Proceeding)

### 8.1 Prerequisites Before Migration

1. **Verify Next.js 16 support** - Contact OpenNext team or test locally
2. **Test NextAuth on Workers** - Create PoC for auth flows
3. **Benchmark Prisma edge performance** - Compare to current latency
4. **Audit bundle size** - Ensure < 10 MiB compressed

### 8.2 Migration Checklist (Phase 20)

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
