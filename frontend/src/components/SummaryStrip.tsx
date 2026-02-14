import { useSummary } from '@/hooks/useSummary';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SummaryStrip() {
  const { data, loading, error } = useSummary();

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-6 py-4 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#1e3a5f] px-6 py-5 text-white shadow-lg">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium opacity-90">QTD Revenue:</span>
          {loading ? (
            <Skeleton className="h-9 w-32 bg-white/20" />
          ) : (
            <span className="text-2xl font-bold tracking-tight">
              {data ? formatCurrency(data.currentQuarterRevenue) : '—'}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium opacity-90">Target:</span>
          {loading ? (
            <Skeleton className="h-9 w-28 bg-white/20" />
          ) : (
            <span className="text-xl font-semibold">
              {data ? formatCurrency(data.targetRevenue) : '—'}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <Skeleton className="h-6 w-20 bg-white/20" />
          ) : data ? (
            <span
              className={
                data.gapPercent <= 0
                  ? 'text-emerald-400 font-semibold'
                  : 'text-red-400 font-semibold'
              }
            >
              {data.gapPercent <= 0 ? '+' : ''}
              {-data.gapPercent.toFixed(0)}% to Goal
            </span>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
    </div>
  );
}
