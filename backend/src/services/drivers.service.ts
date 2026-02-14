import prisma from '../prisma/client';
import { daysBetween } from '../utils/dates';

export interface DriversResponse {
  pipelineSize: number;
  winRate: number;
  averageDealSize: number;
  salesCycleTime: number;
}

export async function getDrivers(): Promise<DriversResponse> {
  const openDeals = await prisma.deal.findMany({
    where: { status: 'open' },
    select: { amount: true },
  });
  const pipelineSize = openDeals.reduce((sum, d) => sum + d.amount, 0);

  const wonDeals = await prisma.deal.findMany({
    where: { status: 'won' },
    select: { amount: true, createdDate: true, closeDate: true },
  });
  const lostDeals = await prisma.deal.findMany({
    where: { status: 'lost' },
    select: { id: true },
  });
  const closedCount = wonDeals.length + lostDeals.length;
  const winRate = closedCount > 0 ? (wonDeals.length / closedCount) * 100 : 0;

  const wonSum = wonDeals.reduce((sum, d) => sum + d.amount, 0);
  const averageDealSize = wonDeals.length > 0 ? wonSum / wonDeals.length : 0;

  const cycles: number[] = [];
  for (const d of wonDeals) {
    if (d.closeDate) {
      const start = new Date(d.createdDate);
      const end = new Date(d.closeDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        cycles.push(daysBetween(start, end));
      }
    }
  }
  const salesCycleTime =
    cycles.length > 0 ? cycles.reduce((a, b) => a + b, 0) / cycles.length : 0;

  return {
    pipelineSize: Math.round(pipelineSize * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    averageDealSize: Math.round(averageDealSize * 100) / 100,
    salesCycleTime: Math.round(salesCycleTime * 10) / 10,
  };
}
