# requirements.md

- Target base URL: https://www.mklanguage.com (production audit)
- Use Playwright suites for full audit (desktop + mobile + mobile-audit + release-gate)
- Do not modify .env files; pass env vars via commands
- Fix any test failures/bugs found
- Run type-check after fixes
- Push changes to remote once approved
