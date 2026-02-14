/**
 * Parse date string (YYYY-MM-DD or ISO) to Date; return null if invalid
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (dateStr == null || dateStr === '') return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Days between two dates (end - start)
 */
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is within the last N days from reference (default now)
 */
export function isWithinLastDays(
  dateStr: string | null | undefined,
  days: number,
  reference: Date = new Date()
): boolean {
  const d = parseDate(dateStr);
  if (!d) return false;
  const diff = daysBetween(d, reference);
  return diff >= 0 && diff <= days;
}
