# Testing Patterns

**Analysis Date:** 2026-01-06

## Test Framework

**Unit Testing:**
- Vitest 4.0.0 - Fast unit test runner
- Config: `vitest.config.ts`
- Environment: jsdom (browser-like for React)
- Setup: `vitest.setup.ts`

**E2E Testing:**
- Playwright 1.56.1 - Browser automation
- Config: `playwright.config.ts`

**Assertion Library:**
- Vitest built-in expect
- @testing-library/jest-dom for DOM matchers
- Playwright expect for E2E assertions

**Run Commands:**
```bash
npm test                        # Run unit tests
npm test -- --watch             # Watch mode
npm test -- path/to/file.test.ts  # Single file
npm run test:e2e                # Run E2E tests
npm run test:e2e:ui             # Playwright UI mode
npm run test:e2e:debug          # Debug mode
npm run audit:mobile            # Mobile audit suite
```

## Test File Organization

**Location:**
- Unit tests: Co-located `*.test.ts(x)` alongside source
- Centralized tests: `__tests__/` directory
- E2E tests: `e2e/*.spec.ts`
- Specialized audits: `tests/mobile-audit/`, `tests/release-gate/`, `tests/phase2/`

**Naming:**
- Unit tests: `module-name.test.ts` or `Component.test.tsx`
- E2E tests: `feature.spec.ts`
- Audit tests: `##-audit-name.spec.ts` (numbered prefix)

**Structure:**
```
__tests__/                    # Centralized tests
├── api/                      # API route tests
│   └── profile/summary.test.ts
└── lib/                      # Library tests
    └── circuit-breaker.test.ts

components/                   # Co-located tests
└── learn/
    ├── WordOfTheDay.tsx
    └── WordOfTheDay.test.tsx

e2e/                          # E2E tests
├── practice.spec.ts
├── reader.spec.ts
└── grammar-practice.spec.ts

tests/                        # Specialized suites
├── mobile-audit/
├── release-gate/
└── phase2/
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('functionName', () => {
    it('should handle success case', () => {
      // arrange
      const input = createTestInput();

      // act
      const result = functionName(input);

      // assert
      expect(result).toEqual(expectedOutput);
    });

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input');
    });
  });
});
```

**Patterns:**
- Use `beforeEach` for per-test setup, avoid `beforeAll`
- Use `afterEach` to restore mocks: `vi.restoreAllMocks()`
- Arrange/Act/Assert pattern in complex tests
- One assertion focus per test (multiple expects OK)

## Mocking

**Framework:**
- Vitest built-in: `vi.mock()`, `vi.fn()`, `vi.mocked()`, `vi.spyOn()`
- Module mocking at top of test file

**Patterns:**
```typescript
import { vi } from 'vitest';
import { externalFunction } from './external';

// Mock module
vi.mock('./external', () => ({
  externalFunction: vi.fn()
}));

describe('test suite', () => {
  it('mocks function', () => {
    const mockFn = vi.mocked(externalFunction);
    mockFn.mockReturnValue('mocked result');

    // test code

    expect(mockFn).toHaveBeenCalledWith('expected arg');
  });
});
```

**What to Mock:**
- External APIs and network calls
- File system operations
- Database calls (Prisma)
- Time/dates (`vi.useFakeTimers`)
- `next-auth/react` session (in `vitest.setup.ts`)

**What NOT to Mock:**
- Internal pure functions
- Simple utilities
- TypeScript types

## Fixtures and Factories

**Test Data:**
```typescript
// Factory function pattern
function createTestUser(overrides?: Partial<User>): User {
  return {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  };
}

// Mock data in test
const mockWordData = {
  word: 'тест',
  translation: 'test',
  example: 'Ова е тест.'
};
```

**Location:**
- Factory functions: Define in test file near usage
- Shared fixtures: `tests/fixtures/` if needed
- Mock data: Inline when simple, factory when complex

## Coverage

**Requirements:**
- No enforced coverage target
- Coverage tracked for awareness
- Focus on critical paths

**Configuration:**
- Provider: v8 (in `vitest.config.ts`)
- Reporters: text, lcov

**View Coverage:**
```bash
npm run test -- --coverage
open coverage/index.html
```

## Test Types

**Unit Tests:**
- Test single function in isolation
- Mock external dependencies
- Fast: each test <100ms
- Examples: `circuit-breaker.test.ts`, `xp.test.ts`

**Component Tests:**
- Test React component rendering
- Mock API calls and context
- Use Testing Library queries
- Examples: `WordOfTheDay.test.tsx`

**Integration Tests:**
- Test multiple modules together
- Mock only external boundaries
- Examples: `session.test.ts` (practice package)

**E2E Tests:**
- Full user journeys through app
- Real browser automation
- Multiple viewport configurations
- Examples: `practice.spec.ts`, `reader.spec.ts`

**Specialized Audits:**
- Mobile viewport testing: `tests/mobile-audit/`
- Release gate checks: `tests/release-gate/`
- Dead click scanning: `tests/phase2/`

## Playwright Configuration

**Projects:**
- `chromium` - Desktop Chrome
- `mobile-320` - iPhone 5 (320px)
- `mobile-360` - Pixel 5 (360px)
- `mobile-390` - iPhone 12 (390px)
- `mobile-audit` - Mobile audit suite
- `release-gate` - Pre-release checks

**Settings:**
- Test timeout: 60 seconds
- Global timeout: 15 minutes
- Screenshots: On failure only
- Video: On first retry
- Parallel: 2 workers local, 1 in CI

**E2E Test Pattern:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Practice Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mk/practice');
    await page.waitForLoadState('networkidle');
  });

  test('should load practice page successfully', async ({ page }) => {
    const heading = page.locator('h1').filter({ hasText: /Train|Вежбај/i }).first();
    await expect(heading).toBeVisible();
  });
});
```

## Common Patterns

**Async Testing:**
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
```

**Error Testing:**
```typescript
it('should throw on invalid input', () => {
  expect(() => parse(null)).toThrow('Cannot parse null');
});

// Async error
it('should reject on file not found', async () => {
  await expect(readConfig('invalid.txt')).rejects.toThrow('ENOENT');
});
```

**Waiting for Conditions:**
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

**Snapshot Testing:**
- Not used in this codebase
- Prefer explicit assertions for clarity

---

*Testing analysis: 2026-01-06*
*Update when test patterns change*
