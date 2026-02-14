import prisma from '../prisma/client';
import { getCurrentQuarter, getPreviousQuarter, isDateInQuarter } from '../utils/quarters';

export interface SummaryResponse {
  currentQuarterRevenue: number;
  targetRevenue: number;
  gapPercent: number;
  changeVsPreviousQuarter: number;
}

export async function getSummary(): Promise<SummaryResponse> {
  const currentQuarter = getCurrentQuarter();
  const previousQuarter = getPreviousQuarter(currentQuarter);

  const allDeals = await prisma.deal.findMany({
    where: { status: 'won' },
    select: { amount: true, closeDate: true },
  });

  const currentRevenue = allDeals
    .filter((d) => d.closeDate && isDateInQuarter(d.closeDate, currentQuarter))
    .reduce((sum, d) => sum + d.amount, 0);

  const previousRevenue = allDeals
    .filter((d) => d.closeDate && isDateInQuarter(d.closeDate, previousQuarter))
    .reduce((sum, d) => sum + d.amount, 0);

  let targetRecord = await prisma.target.findFirst({
    where: { quarter: currentQuarter },
  });
  if (!targetRecord) {
    const latestTarget = await prisma.target.findFirst({
      orderBy: { quarter: 'desc' },
    });
    targetRecord = latestTarget ?? null;
  }
  const targetRevenue = targetRecord?.value ?? 0;

  let gapPercent = 0;
  if (targetRevenue > 0) {
    gapPercent = ((targetRevenue - currentRevenue) / targetRevenue) * 100;
  }

  let changeVsPreviousQuarter = 0;
  if (previousRevenue !== 0) {
    changeVsPreviousQuarter = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  }

  return {
    currentQuarterRevenue: Math.round(currentRevenue * 100) / 100,
    targetRevenue: Math.round(targetRevenue * 100) / 100,
    gapPercent: Math.round(gapPercent * 100) / 100,
    changeVsPreviousQuarter: Math.round(changeVsPreviousQuarter * 100) / 100,
  };
}
