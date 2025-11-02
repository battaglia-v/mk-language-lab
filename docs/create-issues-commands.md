# GitHub Issues Creation Commands

## Prerequisites
You need to switch to your personal GitHub account first:

```bash
gh auth login
# Select: GitHub.com
# Select: Login with a web browser
# Follow the prompts to authenticate with your personal account (battaglia-v)
```

## Then run these commands to create all 25 issues:

### MVP POC Issues (5 issues)

```bash
gh issue create --repo "battaglia-v/mk-language-lab" --title "[MVP POC] Simplify navigation to single learning path" --body "See docs/github-issues-template.md - Issue #1"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[MVP POC] Remove task board and resource library" --body "See docs/github-issues-template.md - Issue #2"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[MVP POC] Mobile responsiveness audit and fixes" --body "See docs/github-issues-template.md - Issue #3"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[MVP POC] Improve API error handling and fallbacks" --body "See docs/github-issues-template.md - Issue #4"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[MVP POC] Update README and documentation" --body "See docs/github-issues-template.md - Issue #5"
```

### Content Complete Issues (4 issues)

```bash
gh issue create --repo "battaglia-v/mk-language-lab" --title "[Content] Expand Family Conversations vocabulary" --body "See docs/github-issues-template.md - Issue #6"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Content] Complete all English and Macedonian translations" --body "See docs/github-issues-template.md - Issue #7"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Content] Create common phrases library" --body "See docs/github-issues-template.md - Issue #8"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Content] Refine tutor system prompts" --body "See docs/github-issues-template.md - Issue #9"
```

### Production Infrastructure Issues (6 issues)

```bash
gh issue create --repo "battaglia-v/mk-language-lab" --title "[Production] Migrate from SQLite to PostgreSQL" --body "See docs/github-issues-template.md - Issue #10"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Production] Implement user authentication with NextAuth.js" --body "See docs/github-issues-template.md - Issue #11"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Production] Add API rate limiting" --body "See docs/github-issues-template.md - Issue #12"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Production] Set up error tracking with Sentry" --body "See docs/github-issues-template.md - Issue #13"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Production] Add analytics and monitoring" --body "See docs/github-issues-template.md - Issue #14"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Production] Create privacy policy and terms of service" --body "See docs/github-issues-template.md - Issue #15"
```

### Android Release Issues (3 issues)

```bash
gh issue create --repo "battaglia-v/mk-language-lab" --title "[Android] Create PWA manifest and service worker" --body "See docs/github-issues-template.md - Issue #16"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Android] Create Play Store listing and assets" --body "See docs/github-issues-template.md - Issue #17"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Android] Beta testing and Play Store submission" --body "See docs/github-issues-template.md - Issue #18"
```

### iOS Release Issues (4 issues)

```bash
gh issue create --repo "battaglia-v/mk-language-lab" --title "[iOS] Set up Apple Developer account and certificates" --body "See docs/github-issues-template.md - Issue #19"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[iOS] Migrate PWA to React Native or Capacitor" --body "See docs/github-issues-template.md - Issue #20"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[iOS] TestFlight beta testing" --body "See docs/github-issues-template.md - Issue #21"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[iOS] Complete App Store listing and submit" --body "See docs/github-issues-template.md - Issue #22"
```

### Bonus Issues (3 issues)

```bash
gh issue create --repo "battaglia-v/mk-language-lab" --title "[Testing] Create E2E test suite" --body "See docs/github-issues-template.md - Issue #23"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Performance] Optimize bundle size and loading performance" --body "See docs/github-issues-template.md - Issue #24"

gh issue create --repo "battaglia-v/mk-language-lab" --title "[Security] Security audit and penetration testing" --body "See docs/github-issues-template.md - Issue #25"
```

## Or create them all at once:

Save this to a file and run it:

```bash
#!/bin/bash
# Save as create-all-issues.sh

for i in {1..25}; do
  echo "Creating issue #$i..."
  gh issue create --repo "battaglia-v/mk-language-lab" \
    --title "Issue #$i - See docs/github-issues-template.md" \
    --body "Full details in docs/github-issues-template.md - Issue #$i"
  sleep 1  # Rate limit protection
done
```

## Faster Option: Use the Web UI

Just go to: https://github.com/battaglia-v/mk-language-lab/issues/new

And copy-paste from `docs/github-issues-template.md` (much faster than CLI!)
