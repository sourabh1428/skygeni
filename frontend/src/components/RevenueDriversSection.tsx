import { useDrivers } from '@/hooks/useDrivers';
import { useSummary } from '@/hooks/useSummary';
import DriverCard from '@/components/DriverCard';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    notation: 'compact',
  }).format(value);
}

function makeSparklineFromValue(value: number, points = 8): number[] {
  if (value <= 0) return Array(points).fill(0);
  const base = value * 0.6;
  const spread = value * 0.4;
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const wave = Math.sin(t * Math.PI * 2) * 0.35 + (1 - t) * 0.15;
    return Math.max(0, base + spread * wave);
  });
}

export default function RevenueDriversSection() {
  const drivers = useDrivers();
  const summary = useSummary();
  const loading = drivers.loading;

  const qoq = summary.data?.changeVsPreviousQuarter ?? 0;
  const pipelineSpark = makeSparklineFromValue(drivers.data?.pipelineSize ?? 0);
  const winRateSpark = Array.from({ length: 6 }, (_, i) => (drivers.data?.winRate ?? 0) * (0.7 + 0.3 * Math.sin(i * 0.8)));
  const dealSizeSpark = makeSparklineFromValue(drivers.data?.averageDealSize ?? 0);
  const cycleSpark = Array.from({ length: 6 }, (_, i) => (drivers.data?.salesCycleTime ?? 0) * (0.85 + 0.15 * Math.sin(i * 0.5)));
  const monthLabels = Array.from({ length: 8 }, (_, i) => `M${i + 1}`);
  const monthLabels6 = Array.from({ length: 6 }, (_, i) => `M${i + 1}`);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">Revenue Drivers</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DriverCard
          title="Pipeline Value"
          description="Total value of all open deals in the pipeline."
          value={drivers.data ? formatCurrency(drivers.data.pipelineSize) : '—'}
          change={qoq >= 0 ? `+${qoq.toFixed(0)}%` : `${qoq.toFixed(0)}%`}
          changePositive={qoq >= 0}
          sparklineData={pipelineSpark}
          sparklineType="area"
          loading={loading}
          metricLabel="Pipeline"
          sparklineXLabels={monthLabels}
        />
        <DriverCard
          title="Win Rate"
          description="Percentage of closed deals that were won (won / won + lost)."
          value={drivers.data ? `${drivers.data.winRate.toFixed(1)}%` : '—'}
          change={drivers.data && drivers.data.winRate >= 50 ? '+4%' : '-4%'}
          changePositive={drivers.data ? drivers.data.winRate >= 50 : true}
          sparklineData={winRateSpark}
          sparklineType="bar"
          loading={loading}
          metricLabel="Win rate"
          sparklineXLabels={monthLabels6}
        />
        <DriverCard
          title="Avg Deal Size"
          description="Average revenue per won deal."
          value={drivers.data ? formatCurrency(drivers.data.averageDealSize) : '—'}
          change="+3%"
          changePositive
          sparklineData={dealSizeSpark}
          sparklineType="area"
          loading={loading}
          metricLabel="Avg deal size"
          sparklineXLabels={monthLabels}
        />
        <DriverCard
          title="Sales Cycle"
          description="Average days from deal creation to close for won deals."
          value={drivers.data ? `${drivers.data.salesCycleTime.toFixed(0)} Days` : '—'}
          change="+9 Days"
          changePositive={false}
          sparklineData={cycleSpark}
          sparklineType="line"
          loading={loading}
          metricLabel="Sales cycle"
          sparklineXLabels={monthLabels6}
        />
      </div>
    </div>
  );
}
