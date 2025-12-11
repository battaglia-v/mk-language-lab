export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div 
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" 
          role="status"
          aria-label="Loading content"
        />
        <p className="text-sm text-muted-foreground" aria-hidden="true">Loading...</p>
      </div>
    </div>
  );
}
