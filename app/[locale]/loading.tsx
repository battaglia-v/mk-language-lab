import { cn } from '@/lib/utils';

/**
 * Minimal loading state for page transitions.
 *
 * Uses a simple, non-branded spinner to avoid the "ajvar jar flash"
 * that occurred with the previous branded loading screen.
 *
 * This component is shown by Next.js during:
 * - Client-side navigation between routes
 * - Suspense boundary loading states
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      {/* Simple loading spinner */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-2.5 w-2.5 rounded-full bg-primary',
                'animate-loading-dot'
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
