import prisma from '../prisma/client';
import { daysBetween, parseDate } from '../utils/dates';

const STALE_DAYS = 30;
const LOW_ACTIVITY_DAYS = 14;

export interface StaleDeal {
  id: string;
  name: string | null;
  amount: number;
  accountId: string;
  repId: string;
  daysOpen: number;
}

export interface UnderperformingRep {
  id: string;
  name: string;
  winRate: number;
}

export interface LowActivityAccount {
  id: string;
  name: string;
  segment: string | null;
}

export interface RiskFactorsResponse {
  staleDeals: StaleDeal[];
  underperformingReps: UnderperformingRep[];
  lowActivityAccounts: LowActivityAccount[];
}

export async function getRiskFactors(): Promise<RiskFactorsResponse> {
  const now = new Date();

  const openDeals = await prisma.deal.findMany({
    where: { status: 'open' },
    select: { id: true, name: true, amount: true, accountId: true, repId: true, createdDate: true },
  });
  const staleDeals: StaleDeal[] = [];
  for (const d of openDeals) {
    const created = parseDate(d.createdDate);
    if (created) {
      const daysOpen = daysBetween(created, now);
      if (daysOpen > STALE_DAYS) {
        staleDeals.push({
          id: d.id,
          name: d.name,
          amount: d.amount,
          accountId: d.accountId,
          repId: d.repId,
          daysOpen,
        });
      }
    }
  }

  const reps = await prisma.rep.findMany({ select: { id: true, name: true } });
  const dealStats = await prisma.deal.groupBy({
    by: ['repId', 'status'],
    where: { status: { in: ['won', 'lost'] } },
    _count: true,
  });
  const repWon = new Map<string, number>();
  const repClosed = new Map<string, number>();
  for (const s of dealStats) {
    repClosed.set(s.repId, (repClosed.get(s.repId) ?? 0) + s._count);
    if (s.status === 'won') {
      repWon.set(s.repId, (repWon.get(s.repId) ?? 0) + s._count);
    }
  }
  let totalWon = 0;
  let totalClosed = 0;
  repClosed.forEach((closed, repId) => {
    totalClosed += closed;
    totalWon += repWon.get(repId) ?? 0;
  });
  const teamAvgWinRate = totalClosed > 0 ? (totalWon / totalClosed) * 100 : 0;

  const underperformingReps: UnderperformingRep[] = [];
  for (const rep of reps) {
    const closed = repClosed.get(rep.id) ?? 0;
    const won = repWon.get(rep.id) ?? 0;
    const winRate = closed > 0 ? (won / closed) * 100 : 0;
    if (closed > 0 && winRate < teamAvgWinRate) {
      underperformingReps.push({ id: rep.id, name: rep.name, winRate: Math.round(winRate * 100) / 100 });
    }
  }

  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - LOW_ACTIVITY_DAYS);
  const recentActivityAccountIds = await prisma.activity.findMany({
    where: { date: { gte: cutoff.toISOString().slice(0, 10) } },
    select: { accountId: true },
    distinct: ['accountId'],
  });
  const activeIds = new Set(recentActivityAccountIds.map((a) => a.accountId));
  const allAccounts = await prisma.account.findMany({
    select: { id: true, name: true, segment: true },
  });
  const lowActivityAccounts: LowActivityAccount[] = allAccounts
    .filter((a) => !activeIds.has(a.id))
    .map((a) => ({ id: a.id, name: a.name, segment: a.segment }));

  return {
    staleDeals,
    underperformingReps,
    lowActivityAccounts,
  };
}
