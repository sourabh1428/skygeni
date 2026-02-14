import SummaryStrip from '@/components/SummaryStrip';
import RevenueDriversSection from '@/components/RevenueDriversSection';
import RiskFactorsCard from '@/components/RiskFactorsCard';
import RecommendedActionsCard from '@/components/RecommendedActionsCard';
import RevenueTrendCombinedChart from '@/charts/RevenueTrendCombinedChart';
import { useRevenueTrend } from '@/hooks/useRevenueTrend';
import { Card, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const revenueTrend = useRevenueTrend();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
          Revenue Intelligence Console
        </h1>
        <SummaryStrip />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RevenueDriversSection />
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 text-base font-semibold text-foreground">
                Revenue Trend (Last 6 Months)
              </h2>
              <RevenueTrendCombinedChart
                data={revenueTrend.data}
                loading={revenueTrend.loading}
                error={revenueTrend.error}
              />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <RiskFactorsCard />
          <RecommendedActionsCard />
        </div>
      </div>
    </div>
  );
}
