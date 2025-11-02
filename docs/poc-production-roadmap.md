# POC to Production Roadmap
**MK Language Lab - Production Readiness Plan**

**Last Updated:** November 2, 2025  
**Owner:** Vincent Battaglia  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the path from current state to production-ready Macedonian learning app, including web deployment and native mobile apps (Android & iOS). The strategy focuses on:

1. **Simplification** - Single learning path (Family Conversations) for POC
2. **Content completion** - All translations, practice materials, and resources production-ready
3. **Infrastructure hardening** - Database, auth, monitoring, scaling
4. **Mobile deployment** - Progressive Web App → Android → iOS

---

## Current State Analysis

### ✅ What's Working
- Next.js 15 App Router with Turbopack
- Bilingual i18n system (English/Macedonian) via next-intl
- Three learning journeys defined (Family, Travel, Culture)
- Translation API with Google Cloud + fallback
- AI Tutor API with OpenAI (mock mode available)
- News aggregation (Time.mk, Meta.mk RSS feeds)
- Task board with localStorage persistence
- Quick practice widget with vocabulary drills
- Session-free experience (no auth required currently)
- Shadcn/ui component library
- Prisma ORM configured (SQLite dev, Postgres prod-ready)

### ⚠️ Needs Work
- **Too many features** - 3 journeys, multiple practice sections, resource library
- **Incomplete content** - Many placeholder translations, limited practice vocabulary
- **No real auth** - AuthGuard is empty passthrough
- **SQLite only** - No production database configured
- **No monitoring** - No error tracking, analytics, or logging
- **No mobile optimization** - Not tested on mobile, no PWA manifest
- **API rate limits** - No rate limiting on translation/tutor endpoints
- **No content moderation** - Tutor responses unchecked
- **Resource links broken** - PDF viewer references undefined resources
- **No testing coverage** - Only 1 test file for QuickPracticeWidget

---

## Simplified POC Strategy

### Single Learning Path: Family Conversations

**Why Family Conversations?**
- Most emotional connection for heritage learners
- Clear use case: reconnecting with relatives
- Manageable vocabulary scope (greetings, family terms, common questions)
- Natural conversation flow easier to practice than travel logistics

**Features to KEEP:**
1. ✅ Journey hub (showing only Family path)
2. ✅ Quick practice widget (Macedonian → English, English → Macedonian)
3. ✅ AI Tutor (family conversation coaching)
4. ✅ Translation tool (for real-time conversation prep)
5. ✅ News feed (cultural immersion, reading practice)

**Features to REMOVE/DEFER:**
- ❌ Travel & Culture journeys (defer to v2)
- ❌ Task board (defer to v2)
- ❌ Resource library with PDF viewer (defer to v2)
- ❌ Learn section (/learn/grammar, /learn/phrases, etc.) - merge into practice
- ❌ Pronunciation lab (defer to v2)
- ❌ About page (low priority)

---

## Milestone Breakdown

### Milestone 1: MVP POC (Week 1-2)
**Goal:** Deployable single-path learning experience  
**Target:** Vercel web deployment  
**Deadline:** 2 weeks

**Key Deliverables:**
- Simplified navigation (remove unused routes)
- Family journey content complete (100+ vocabulary items, 20+ phrases)
- Practice widget fully functional
- Tutor prompts tailored for family conversations
- Translation API stable with error handling
- News feed working reliably
- Mobile-responsive UI tested on iOS/Android browsers
- README updated with POC scope

### Milestone 2: Content Complete (Week 3-4)
**Goal:** Production-quality content and translations  
**Target:** Beta user testing  
**Deadline:** 2 weeks

**Key Deliverables:**
- All English translations reviewed for accuracy
- All Macedonian translations reviewed by native speaker
- Practice vocabulary expanded to 300+ terms (family domain)
- Common phrases library (50+ expressions)
- Tutor system prompts refined with cultural context
- News feed enriched with fallback descriptions/images
- Error messages fully translated
- Localization QA checklist complete

### Milestone 3: Production Infrastructure (Week 5-6)
**Goal:** Enterprise-ready hosting and monitoring  
**Target:** Production Vercel deployment  
**Deadline:** 2 weeks

**Key Deliverables:**
- Postgres database (Vercel/Neon/Supabase)
- User authentication (NextAuth.js or Clerk)
- Session management for tutor history
- API rate limiting (Upstash Redis)
- Error tracking (Sentry)
- Analytics (Vercel Analytics + Plausible)
- Performance monitoring (Vercel Speed Insights)
- Backup strategy for user data
- GDPR compliance basics (privacy policy, cookie consent)
- Environment variable validation
- Health check endpoints
- Load testing results

### Milestone 4: Android Release (Week 7-9)
**Goal:** MK Language Lab on Google Play Store  
**Target:** Public release  
**Deadline:** 3 weeks

**Key Deliverables:**
- PWA manifest with offline support
- Service worker for caching
- App icons (512x512, 192x192, maskable variants)
- Splash screens
- Install prompt UX
- TWA (Trusted Web Activity) setup OR React Native wrapper
- Play Store listing (description, screenshots, privacy policy)
- App signing key generated and secured
- Beta testing via internal track (min 20 testers, 14 days)
- Closed testing feedback incorporated
- Play Store review submission
- Post-launch monitoring dashboard

### Milestone 5: iOS Release (Week 10-14)
**Goal:** MK Language Lab on Apple App Store  
**Target:** Public release  
**Deadline:** 4-5 weeks

**Key Deliverables:**
- Apple Developer account ($99/year)
- App Store Connect setup
- React Native or Capacitor migration (PWAs have limited iOS support)
- iOS-specific UI polish (safe areas, haptics, gestures)
- TestFlight beta testing (min 25 testers, 2-3 weeks)
- App Store listing (description, screenshots, keywords)
- Privacy nutrition label filled out
- App Store review guidelines compliance check
- In-app purchase setup (if freemium model)
- Push notification infrastructure (if needed)
- iOS-specific bugs resolved
- App Store review submission
- Post-launch monitoring dashboard

---

## Issue Categories

### 🎯 POC Simplification
- Remove unused routes and components
- Update navigation structure
- Simplify home page to single journey focus
- Remove localStorage complexity where possible

### 📝 Content & Localization
- Audit and complete English translations
- Audit and complete Macedonian translations
- Expand family conversation vocabulary
- Create phrase library
- Review tutor prompts for accuracy
- Add cultural context to content

### 🔧 Infrastructure & Backend
- Migrate to Postgres
- Implement authentication
- Add API rate limiting
- Set up error tracking
- Configure analytics
- Create backup strategy
- Add environment validation

### 📱 Mobile Optimization
- Responsive design audit
- Touch interaction improvements
- PWA manifest creation
- Service worker implementation
- Offline mode support
- Install prompt UX

### 🤖 AI & APIs
- Improve tutor system prompts
- Add content moderation
- Enhance error handling
- Implement retry logic
- Add response caching
- Rate limit protection

### ✅ Testing & QA
- Unit test coverage (target: 70%)
- Integration tests for APIs
- E2E tests for critical flows
- Mobile device testing
- Browser compatibility testing
- Accessibility audit (WCAG 2.1 AA)
- Load testing
- Security audit

### 🚀 Deployment & DevOps
- CI/CD pipeline setup
- Staging environment
- Database migration scripts
- Rollback procedures
- Monitoring dashboards
- Incident response plan

---

## Technical Decisions

### Database: PostgreSQL
- **Why:** Vercel Postgres integration, better than SQLite for production
- **Where:** Vercel Postgres or Neon (free tier sufficient for POC)
- **Migration:** Prisma migrate from SQLite schema

### Authentication: NextAuth.js
- **Why:** Native Next.js integration, supports Google/GitHub OAuth
- **Alternative:** Clerk (if we need more features like user management UI)
- **Scope:** Email + Google OAuth for POC

### Rate Limiting: Upstash Redis
- **Why:** Vercel partnership, generous free tier, edge-compatible
- **Endpoints:** /api/translate (10 req/min), /api/tutor (5 req/min)

### Error Tracking: Sentry
- **Why:** Industry standard, good free tier
- **Scope:** Client + server errors, performance monitoring

### Analytics: Vercel Analytics + Plausible
- **Why:** Privacy-focused, GDPR-compliant, no cookie banner needed
- **Metrics:** Page views, user flows, conversion funnels

### Mobile: PWA First, React Native Later
- **POC:** Progressive Web App (web technologies)
- **Android:** TWA (Trusted Web Activity) wraps PWA
- **iOS:** Capacitor or React Native (PWAs limited on iOS)

---

## Risk Assessment

### High Risk
1. **iOS App Store Approval** - Complex guidelines, unpredictable review process
   - *Mitigation:* Start iOS prep early, hire iOS consultant if needed
2. **Content Quality** - Need native speaker review for credibility
   - *Mitigation:* Engage native Macedonian translator/reviewer
3. **API Costs** - OpenAI + Google Translate usage could spike
   - *Mitigation:* Implement aggressive rate limiting, caching, free tier quotas

### Medium Risk
1. **Mobile Performance** - Next.js can be heavy for low-end Android devices
   - *Mitigation:* Performance budget, image optimization, lazy loading
2. **User Retention** - POC might feel limited with single journey
   - *Mitigation:* Clear roadmap communication, email capture for v2 launch
3. **Database Scaling** - Postgres free tier limits
   - *Mitigation:* Monitor usage, plan upgrade path

### Low Risk
1. **Browser Compatibility** - Modern browsers well-supported
2. **Deployment** - Vercel proven reliable
3. **Content Updates** - Easy to edit JSON translation files

---

## Success Metrics

### MVP POC (Milestone 1)
- [ ] App loads in <2s on 3G connection
- [ ] Zero critical bugs in 1 week of internal testing
- [ ] Mobile responsive on iPhone SE, Galaxy S21, iPad
- [ ] 100% of navigation links work
- [ ] Translation API <500ms p95 latency

### Content Complete (Milestone 2)
- [ ] Native speaker approval rating >4.5/5
- [ ] Zero placeholder content visible
- [ ] Localization coverage: 100% English, 95%+ Macedonian
- [ ] Practice vocabulary: 300+ terms
- [ ] Phrase library: 50+ expressions

### Production Infrastructure (Milestone 3)
- [ ] 99.9% uptime SLA
- [ ] <100ms median API response time
- [ ] Error rate <0.1%
- [ ] User data backup automated daily
- [ ] GDPR compliance checklist 100% complete

### Android Release (Milestone 4)
- [ ] Play Store approval within 7 days
- [ ] 4.0+ star rating from beta testers
- [ ] <2% crash rate
- [ ] 50+ active users in first week

### iOS Release (Milestone 5)
- [ ] App Store approval within 14 days
- [ ] 4.0+ star rating from TestFlight users
- [ ] <1% crash rate (iOS standard higher)
- [ ] Feature parity with Android version

---

## Resource Requirements

### Development Time
- **Engineering:** 14 weeks (full-time equivalent)
- **Design:** 2 weeks (UI polish, app store assets)
- **Content:** 3 weeks (translation, review, QA)
- **QA/Testing:** Ongoing, ~20% of engineering time

### Financial Budget
- **Apple Developer Program:** $99/year (required for iOS)
- **Google Play Console:** $25 one-time (required for Android)
- **Infrastructure:** $0-50/month (Vercel free tier, upgrade as needed)
- **Monitoring Tools:** $0-30/month (Sentry, Plausible free tiers cover POC)

### External Help
- **Native Macedonian Speaker:** Content review, cultural accuracy check
- **iOS Developer (Optional):** Consultation if React Native migration needed
- **Legal (Optional):** Privacy policy template review

---

## Open Questions

1. **Monetization Strategy:** Free with ads? Freemium? Paid upfront?
2. **User Accounts:** Required or optional? (affects complexity significantly)
3. **Offline Mode Scope:** Just read? Or allow practice without internet?
4. **Native Speaker Availability:** Who can review content? Timeline?
5. **iOS Migration:** PWA sufficient or need full React Native rewrite?
6. **Content Updates:** How often? Who maintains? CMS needed?
7. **Community Features:** Forums? User-generated content? (defer to v2?)

---

## Next Steps

1. **Week 1 Focus:**
   - ✅ Create this roadmap document
   - ⏳ Create GitHub milestones and issues
   - ⏳ Remove Travel & Culture journeys (hide in UI, keep code)
   - ⏳ Audit and expand Family journey vocabulary
   - ⏳ Test current app on mobile devices

2. **Immediate Actions:**
   - Set up Vercel project for staging environment
   - Connect Postgres database (Vercel or Neon)
   - Enable Vercel Analytics
   - Create content review checklist
   - Schedule translation review session

3. **Blockers to Resolve:**
   - Find native Macedonian speaker for content review
   - Decide on authentication strategy (NextAuth vs Clerk)
   - Confirm iOS development approach (PWA vs React Native)

---

## References

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Google Play Store Publishing](https://developer.android.com/distribute)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Prisma Postgres Migration](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

---

**Document Status:** Draft → Ready for Review  
**Next Review Date:** November 9, 2025  
**Feedback Welcome:** @vbattaglia
