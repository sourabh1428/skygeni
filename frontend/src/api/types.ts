export interface SummaryResponse {
  currentQuarterRevenue: number;
  targetRevenue: number;
  gapPercent: number;
  changeVsPreviousQuarter: number;
}

export interface DriversResponse {
  pipelineSize: number;
  winRate: number;
  averageDealSize: number;
  salesCycleTime: number;
}

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

export interface RevenueTrendResponse {
  months: string[];
  revenue: number[];
  target: number[];
}
