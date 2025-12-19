'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function BuildInfo({ className }: { className?: string }) {
  // Gate behind env var - hidden in production by default
  if (process.env.NEXT_PUBLIC_SHOW_BUILD_INFO !== 'true') {
    return null;
  }

  const [expanded, setExpanded] = useState(false);
  const gitSha = process.env.NEXT_PUBLIC_GIT_SHA || 'dev';
  const shortSha = gitSha.slice(0, 7);

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className={cn(
        'fixed bottom-20 right-2 z-40 rounded-full px-2 py-1 text-[10px] font-mono',
        'bg-black/60 text-white/60 hover:bg-black/80 hover:text-white/80',
        'transition-all sm:bottom-2',
        className
      )}
    >
      {expanded ? `SHA: ${gitSha}` : `v${shortSha}`}
    </button>
  );
}
