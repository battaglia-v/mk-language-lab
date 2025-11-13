# GitHub Milestones Setup Guide

GitHub CLI does not support milestone creation directly, so these need to be created via the web UI.

## Create Milestones

Visit: https://github.com/battaglia-v/mk-language-lab/milestones/new

Create these 5 milestones:

### Milestone 1: MVP POC
- **Title:** MVP POC
- **Due Date:** November 16, 2025
- **Description:** Simplify app to single learning path (Family Conversations), remove complex features, ensure mobile-ready and production-quality APIs. Target: Functional POC with core features only.

### Milestone 2: Content Complete  
- **Title:** Content Complete
- **Due Date:** November 30, 2025
- **Description:** Expand vocabulary to 300+ terms, complete all translations (EN/MK), create common phrases library, refine tutor prompts with cultural context. Requires native Macedonian speaker review.

### Milestone 3: Production Infrastructure
- **Title:** Production Infrastructure
- **Due Date:** December 14, 2025  
- **Description:** Migrate to PostgreSQL, implement authentication, add rate limiting, set up error tracking, add analytics/monitoring, create privacy policy and terms. Full production-ready backend.

### Milestone 4: Android Release _(paused)_
- **Title:** Android Release
- **Due Date:** January 4, 2026
- **Description:** Convert to PWA, create Play Store listing with assets, beta test for 14+ days with 20+ users, submit and launch on Google Play Store.

### Milestone 5: iOS Release _(paused)_
- **Title:** iOS Release  
- **Due Date:** February 1, 2026
- **Description:** Set up Apple Developer account, migrate to Capacitor for native iOS, TestFlight beta testing (25+ testers, 2-3 weeks), submit and launch on App Store.

---

## Assign Issues to Milestones

After creating milestones, assign issues using GitHub CLI:

```bash
# Get milestone numbers (run this first)
gh api repos/battaglia-v/mk-language-lab/milestones | jq '.[] | {number, title}'

# Then assign issues (replace MILESTONE_NUMBER with actual numbers from above)
# MVP POC (Issues #10, 14-17)
gh issue edit 10 --milestone "MVP POC" --repo battaglia-v/mk-language-lab
gh issue edit 14 --milestone "MVP POC" --repo battaglia-v/mk-language-lab
gh issue edit 15 --milestone "MVP POC" --repo battaglia-v/mk-language-lab
gh issue edit 16 --milestone "MVP POC" --repo battaglia-v/mk-language-lab
gh issue edit 17 --milestone "MVP POC" --repo battaglia-v/mk-language-lab

# Content Complete (Issues #18-21)
gh issue edit 18 --milestone "Content Complete" --repo battaglia-v/mk-language-lab
gh issue edit 19 --milestone "Content Complete" --repo battaglia-v/mk-language-lab
gh issue edit 20 --milestone "Content Complete" --repo battaglia-v/mk-language-lab
gh issue edit 21 --milestone "Content Complete" --repo battaglia-v/mk-language-lab

# Production Infrastructure (Issues #22-27)
gh issue edit 22 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab
gh issue edit 23 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab
gh issue edit 24 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab
gh issue edit 25 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab
gh issue edit 26 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab
gh issue edit 27 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab

# Android Release (Issues #28-30)
gh issue edit 28 --milestone "Android Release" --repo battaglia-v/mk-language-lab
gh issue edit 29 --milestone "Android Release" --repo battaglia-v/mk-language-lab
gh issue edit 30 --milestone "Android Release" --repo battaglia-v/mk-language-lab

# iOS Release (Issues #31-34)
gh issue edit 31 --milestone "iOS Release" --repo battaglia-v/mk-language-lab
gh issue edit 32 --milestone "iOS Release" --repo battaglia-v/mk-language-lab
gh issue edit 33 --milestone "iOS Release" --repo battaglia-v/mk-language-lab
gh issue edit 34 --milestone "iOS Release" --repo battaglia-v/mk-language-lab

# Cross-cutting (Issues #35-37 - assign to relevant milestone or leave unassigned)
gh issue edit 35 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab  # Testing
gh issue edit 36 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab  # Performance
gh issue edit 37 --milestone "Production Infrastructure" --repo battaglia-v/mk-language-lab  # Security
```

---

## Add Issues to Project Board

```bash
# Get project ID
gh project list --owner battaglia-v

# Add all issues to project (replace PROJECT_ID with actual ID)
for issue in {10,14..37}; do
  gh project item-add PROJECT_ID --owner battaglia-v --url "https://github.com/battaglia-v/mk-language-lab/issues/$issue"
done
```

Or add them via the web UI by dragging issues to the project board at:
https://github.com/users/battaglia-v/projects/2
