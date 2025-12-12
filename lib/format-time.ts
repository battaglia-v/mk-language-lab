/**
 * Format elapsed time in seconds to a human-readable string
 *
 * @param seconds - The number of seconds to format
 * @returns Formatted time string in M:SS or H:MM:SS format
 *
 * @example
 * formatElapsedTime(65) // '1:05'
 * formatElapsedTime(3661) // '1:01:01'
 */
export function formatElapsedTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format milliseconds to a human-readable duration
 *
 * @param ms - The number of milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  return formatElapsedTime(totalSeconds);
}
