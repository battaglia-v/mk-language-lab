export function differenceInMinutes(date: Date, compareDate: Date): number {
  return Math.round((date.getTime() - compareDate.getTime()) / 60000);
}

export function formatDistanceStrict(date: Date, compareDate: Date, options: { addSuffix?: boolean } = {}): string {
  const diffMs = Math.abs(compareDate.getTime() - date.getTime());
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 60) {
    const label = `${diffMinutes}m`;
    return options.addSuffix ? suffix(label, date < compareDate) : label;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    const label = `${diffHours}h`;
    return options.addSuffix ? suffix(label, date < compareDate) : label;
  }
  const diffDays = Math.round(diffHours / 24);
  const label = `${diffDays}d`;
  return options.addSuffix ? suffix(label, date < compareDate) : label;
}

function suffix(label: string, isFuture: boolean): string {
  return isFuture ? `${label} left` : `${label} ago`;
}
