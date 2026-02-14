import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), '..', 'data');

function readJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function mapStageToStatus(stage: string | null | undefined): string {
  if (!stage) return 'open';
  const s = String(stage).toLowerCase();
  if (s.includes('closed') && s.includes('won')) return 'won';
  if (s.includes('closed') && s.includes('lost')) return 'lost';
  return 'open';
}

function monthToQuarter(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const q = Math.ceil(m / 3);
  return `${year}-Q${q}`;
}

interface AccountRow {
  id?: string;
  account_id?: string;
  name?: string;
  segment?: string;
}

interface RepRow {
  id?: string;
  rep_id?: string;
  name?: string;
}

interface DealRow {
  id?: string;
  deal_id?: string;
  accountId?: string;
  account_id?: string;
  repId?: string;
  rep_id?: string;
  stage?: string;
  amount?: number | null;
  createdDate?: string;
  created_at?: string;
  closeDate?: string | null;
  closed_at?: string | null;
}

interface ActivityRow {
  id?: string;
  activity_id?: string;
  accountId?: string;
  deal_id?: string;
  date?: string;
  timestamp?: string;
  type?: string;
}

interface TargetRow {
  id?: string;
  quarter?: string;
  month?: string;
  value?: number;
  target?: number;
}

async function main() {
  await prisma.deal.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.account.deleteMany();
  await prisma.rep.deleteMany();
  await prisma.target.deleteMany();

  const accounts = readJson<AccountRow[]>('accounts.json');
  for (const row of accounts) {
    const id = row.id ?? row.account_id ?? `acc-${Math.random().toString(36).slice(2, 9)}`;
    const name = row.name ?? 'Unknown';
    const segment = row.segment ?? null;
    await prisma.account.create({ data: { id, name, segment } });
  }

  const reps = readJson<RepRow[]>('reps.json');
  for (const row of reps) {
    const id = row.id ?? row.rep_id ?? `rep-${Math.random().toString(36).slice(2, 9)}`;
    const name = row.name ?? 'Unknown';
    await prisma.rep.create({ data: { id, name } });
  }

  const dealsJson = readJson<DealRow[]>('deals.json');
  const dealIdToAccountId = new Map<string, string>();

  for (const row of dealsJson) {
    const id = row.id ?? row.deal_id ?? `deal-${Math.random().toString(36).slice(2, 9)}`;
    const accountId = row.accountId ?? row.account_id ?? '';
    const repId = row.repId ?? row.rep_id ?? '';
    const amount = typeof row.amount === 'number' ? row.amount : 0;
    const status = mapStageToStatus(row.stage);
    const createdDate = row.createdDate ?? row.created_at ?? new Date().toISOString().slice(0, 10);
    const closeDate = row.closeDate ?? row.closed_at ?? null;
    if (!accountId || !repId) continue;
    dealIdToAccountId.set(id, accountId);
    await prisma.deal.create({
      data: { id, accountId, repId, name: null, amount, status, createdDate, closeDate },
    });
  }

  const activities = readJson<ActivityRow[]>('activities.json');
  for (const row of activities) {
    const id = row.id ?? row.activity_id ?? `act-${Math.random().toString(36).slice(2, 9)}`;
    const accountId = row.accountId ?? (row.deal_id ? dealIdToAccountId.get(row.deal_id) : null) ?? '';
    const date = row.date ?? row.timestamp ?? new Date().toISOString().slice(0, 10);
    const type = row.type ?? null;
    if (!accountId) continue;
    await prisma.activity.create({ data: { id, accountId, date, type } });
  }

  const targetsRaw = readJson<TargetRow[]>('targets.json');
  const quarterSums = new Map<string, number>();
  for (const row of targetsRaw) {
    const quarter = row.quarter ?? (row.month ? monthToQuarter(row.month) : 'unknown');
    const value = typeof row.value === 'number' ? row.value : (typeof row.target === 'number' ? row.target : 0);
    quarterSums.set(quarter, (quarterSums.get(quarter) ?? 0) + value);
  }
  for (const [quarter, value] of quarterSums) {
    if (quarter === 'unknown') continue;
    await prisma.target.create({ data: { id: quarter, quarter, value } });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
