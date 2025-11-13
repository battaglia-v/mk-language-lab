import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

if (typeof (globalThis as Record<string, unknown>).__DEV__ === 'undefined') {
  (globalThis as Record<string, unknown>).__DEV__ = false;
}

vi.mock('next-auth/react', () => {
  return {
    __esModule: true,
    useSession: () => ({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    }),
    SessionProvider: ({ children }: { children: ReactNode }) => children,
  };
});

afterEach(() => {
  cleanup();
});
