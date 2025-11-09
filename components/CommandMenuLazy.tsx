'use client';

import dynamic from 'next/dynamic';

// Lazy load CommandMenu - only loads when user opens it (Cmd+K)
export const CommandMenuLazy = dynamic(
  () => import('@/components/CommandMenu').then((mod) => ({ default: mod.CommandMenu })),
  { ssr: false }
);
