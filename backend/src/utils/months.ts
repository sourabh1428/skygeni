/**
 * Get last N months as short labels (e.g. "Oct", "Nov")
 */
export function getLastMonthLabels(count: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(formatter.format(d));
  }
  return labels;
}

/**
 * Get YYYY-MM for the month that is i months ago (i=0 = current month)
 */
export function getMonthKey(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Check if dateStr (YYYY-MM-DD) falls in the given YYYY-MM
 */
export function isDateInMonth(dateStr: string, yearMonth: string): boolean {
  return dateStr.startsWith(yearMonth);
}
