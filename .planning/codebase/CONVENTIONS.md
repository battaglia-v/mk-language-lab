# Coding Conventions

**Analysis Date:** 2026-01-06

## Naming Patterns

**Files:**
- PascalCase.tsx for React components (`WordOfTheDay.tsx`, `StatsOverview.tsx`)
- camelCase.ts or kebab-case.ts for utilities (`circuit-breaker.ts`, `rate-limit.ts`)
- *.test.ts(x) for unit tests alongside source
- *.spec.ts for Playwright E2E tests in `e2e/`
- route.ts for API handlers (Next.js convention)

**Functions:**
- camelCase for all functions (`getPracticeCategories()`, `evaluatePracticeAnswer()`)
- PascalCase for React components (function name matches file name)
- Async functions: No special prefix, just `async` keyword
- Event handlers: `handle` prefix (`handleClick`, `handleSubmit`)

**Variables:**
- camelCase for regular variables (`isSpeaking`, `ttsSupported`)
- UPPER_SNAKE_CASE for constants (`SESSION_TARGET`, `XP_AWARDS`)
- No underscore prefix for private (TypeScript visibility modifiers instead)

**Types:**
- PascalCase for interfaces (`CircuitBreakerConfig`, `RequestRecord`)
- PascalCase for type aliases (`WordOfTheDayData`, `PracticeDirection`)
- Prefer `interface` over `type` for object shapes
- No `I` prefix for interfaces

## Code Style

**Formatting:**
- Prettier with default settings (no `.prettierrc` file)
- 2 space indentation
- Single quotes for strings
- Semicolons required
- Scripts: `npm run format`, `npm run format:check`

**Linting:**
- ESLint 9.0.0 with flat config (`eslint.config.mjs`)
- Extends: `eslint-config-next/core-web-vitals`
- Max warnings: 10 in CI (`eslint . --max-warnings 10`)
- Run: `npm run lint`, `npm run lint:fix`

**Pre-commit Hooks:**
- Husky with `.husky/pre-commit`
- lint-staged for staged files only
- Type checking via `npm run type-check`
- Unit tests via `npm test`

## Import Organization

**Order:**
1. `'use client'` or `'use server'` directives (if needed)
2. External packages (`react`, `next`, `vitest`, etc.)
3. Type imports (`import type { ... }`)
4. Internal modules (`@/`, `@mk/`)
5. Relative imports (`./`, `../`)

**Path Aliases:**
- `@/*` → repository root (`tsconfig.json`)
- `@mk/tokens` → `packages/tokens/src/index.ts`
- `@mk/ui` → `packages/ui/src/index.ts`
- `@mk/api-client` → `packages/api-client/src/index.ts`
- `@mk/practice` → `packages/practice/src/index.ts`

**Example:**
```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import type { WordOfTheDayData } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
```

## Error Handling

**Patterns:**
- Throw errors in service layer, catch at API route boundaries
- Custom error types in `lib/errors.ts` (NotFoundError, ValidationError)
- try/catch in all API route handlers
- Async errors: use try/catch, not .catch() chains

**Error Response Format:**
```typescript
return NextResponse.json(
  { error: 'Description of error' },
  { status: 400 }
);
```

**Logging:**
- Use structured prefixes: `[API]`, `[AUTH]`, `[CRON]`
- Include context: `console.error('[API] Failed:', { userId, error })`
- Sentry for production error aggregation

## Logging

**Framework:**
- Console methods (console.log, console.error, console.warn)
- Sentry for error tracking in production

**Patterns:**
- Prefix logs with context: `[API_NAME]`, `[AUTH]`, `[MOBILE]`
- Include structured data objects when helpful
- Log at service boundaries and error conditions
- Avoid console.log in production code paths (use error tracking)

**Example:**
```typescript
console.log('[ACCOUNT_DELETION] Account deleted:', {
  userId: session.user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});
```

## Comments

**When to Comment:**
- Explain why, not what
- Document business logic and non-obvious decisions
- JSDoc for exported functions and classes
- Avoid obvious comments (`// increment counter`)

**JSDoc Style:**
```typescript
/**
 * Circuit breaker implementation for fault tolerance.
 * States: CLOSED (normal), OPEN (failing fast), HALF_OPEN (testing recovery)
 */
export class CircuitBreaker { ... }
```

**TODO Format:**
- `// TODO: description` (no username, use git blame)
- Link to issue if exists: `// TODO: Fix race condition (issue #123)`

## Function Design

**Size:**
- Keep under 50 lines
- Extract helpers for complex logic
- One level of abstraction per function

**Parameters:**
- Max 3 parameters
- Use options object for 4+ parameters
- Destructure in parameter list: `function process({ id, name }: ProcessParams)`

**Return Values:**
- Explicit return statements
- Return early for guard clauses
- Use typed return values

## Module Design

**Exports:**
- Named exports for services and utilities
- Default exports for React components
- Barrel exports via index.ts for public APIs

**Patterns:**
- Module exports with functions (not class instantiation for services)
- Provider pattern for React context
- Custom hooks pattern for reusable stateful logic

**API Client Modules:**
```typescript
// packages/api-client/src/practice.ts
export async function getPracticeSession(id: string): Promise<Session> { ... }
export async function submitAnswer(data: AnswerData): Promise<Result> { ... }
```

## TypeScript Configuration

**Compiler Options:**
- Strict mode enabled
- Target: ES2017
- JSX: react-jsx (automatic)
- Module resolution: bundler
- Isolated modules: true

**Test Exclusions:**
- `**/*.test.ts`, `**/*.test.tsx`
- `**/*.spec.ts`, `**/*.spec.tsx`

---

*Convention analysis: 2026-01-06*
*Update when patterns change*
