/**
 * Get current quarter string (e.g. "2026-Q1")
 */
export function getCurrentQuarter(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

/**
 * Get previous quarter string (e.g. "2025-Q4")
 */
export function getPreviousQuarter(currentQuarter: string): string {
  const [yearStr, qStr] = currentQuarter.split('-');
  const year = parseInt(yearStr, 10);
  const q = parseInt(qStr.replace('Q', ''), 10);
  if (q === 1) {
    return `${year - 1}-Q4`;
  }
  return `${year}-Q${q - 1}`;
}

/**
 * Check if a date string falls within a quarter (YYYY-Qn)
 */
export function isDateInQuarter(dateStr: string, quarter: string): boolean {
  const [yearStr, qStr] = quarter.split('-');
  const year = parseInt(yearStr, 10);
  const q = parseInt(qStr.replace('Q', ''), 10);
  const startMonth = (q - 1) * 3 + 1;
  const endMonth = q * 3;
  const d = new Date(dateStr);
  const dYear = d.getFullYear();
  const dMonth = d.getMonth() + 1;
  if (dYear !== year) return false;
  return dMonth >= startMonth && dMonth <= endMonth;
}
