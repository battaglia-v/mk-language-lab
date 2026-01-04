# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Email:** Open a GitHub issue with the label `security` (for non-sensitive issues)

**For sensitive vulnerabilities:** Please do NOT open a public issue. Instead:
1. Create a private security advisory via GitHub's Security tab
2. Or email the maintainers directly (see repository settings)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### What NOT to Include

- Personal user data
- Database dumps or credentials
- Screenshots containing sensitive information

## Response Timeline

| Stage | Timeframe |
|-------|-----------|
| Initial acknowledgment | 48 hours |
| Preliminary assessment | 1 week |
| Fix development | Depends on severity |
| Public disclosure | After fix is deployed |

## Scope

### In Scope
- Authentication/authorization bypasses
- SQL injection or other injection attacks
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Sensitive data exposure
- API security issues
- Session management flaws

### Out of Scope
- Social engineering attacks
- Physical attacks
- Denial of service (DoS/DDoS)
- Issues in third-party dependencies (report to them directly)
- Issues requiring physical access to a user's device

## Safe Harbor

We will not pursue legal action against security researchers who:
- Act in good faith
- Avoid privacy violations, data destruction, or service disruption
- Report vulnerabilities promptly
- Give us reasonable time to address the issue before disclosure

## Security Best Practices

If you're deploying your own instance:

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use strong, unique credentials
3. **Authentication**: Enable rate limiting on auth endpoints
4. **Updates**: Keep dependencies up to date
5. **HTTPS**: Always use HTTPS in production

---

Thank you for helping keep MKLanguage secure!
