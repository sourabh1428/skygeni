import prisma from '../prisma/client';
import { getLastMonthLabels, getMonthKey, isDateInMonth } from '../utils/months';

const MONTH_COUNT = 6;

export interface RevenueTrendResponse {
  months: string[];
  revenue: number[];
  target: number[];
}

export async function getRevenueTrend(): Promise<RevenueTrendResponse> {
  const months = getLastMonthLabels(MONTH_COUNT);
  const monthKeys = Array.from({ length: MONTH_COUNT }, (_, i) => getMonthKey(MONTH_COUNT - 1 - i));

  const wonDeals = await prisma.deal.findMany({
    where: { status: 'won' },
    select: { amount: true, closeDate: true },
  });

  const revenue = monthKeys.map((ym) =>
    wonDeals
      .filter((d) => d.closeDate && isDateInMonth(d.closeDate, ym))
      .reduce((sum, d) => sum + d.amount, 0)
  );

  const targets = await prisma.target.findMany({ select: { quarter: true, value: true } });
  const targetByQuarter = new Map(targets.map((t) => [t.quarter, t.value]));
  const sortedQuarters = [...targetByQuarter.keys()].sort();
  const lastKnownTarget = sortedQuarters.length > 0
    ? (targetByQuarter.get(sortedQuarters[sortedQuarters.length - 1]) ?? 0) / 3
    : 0;

  const target: number[] = monthKeys.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    const q = Math.ceil(m / 3);
    const quarter = `${y}-Q${q}`;
    const quarterTarget = targetByQuarter.get(quarter) ?? 0;
    const monthly = quarterTarget > 0 ? quarterTarget / 3 : lastKnownTarget;
    return monthly;
  });

  return {
    months,
    revenue: revenue.map((r) => Math.round(r * 100) / 100),
    target: target.map((t) => Math.round(t * 100) / 100),
  };
}
