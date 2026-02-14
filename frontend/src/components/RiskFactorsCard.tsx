import { useRiskFactors } from '@/hooks/useRiskFactors';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RiskFactorsCard() {
  const { data, loading, error } = useRiskFactors();

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-destructive">{error}</CardContent>
      </Card>
    );
  }

  const staleCount = data?.staleDeals?.length ?? 0;
  const repItems = data?.underperformingReps?.slice(0, 3) ?? [];
  const accountCount = data?.lowActivityAccounts?.length ?? 0;

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col p-4">
        <h2 className="mb-4 text-base font-semibold text-foreground">Top Risk Factors</h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ul className="space-y-3">
            {staleCount > 0 && (
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-foreground">
                  <strong>{staleCount}</strong> Enterprise deals stuck over 30 days
                </span>
              </li>
            )}
            {repItems.map((rep) => (
              <li key={rep.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-foreground">
                  Rep <strong>{rep.name}</strong> – Win Rate: <strong>{rep.winRate.toFixed(0)}%</strong>
                </span>
              </li>
            ))}
            {accountCount > 0 && (
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-foreground">
                  <strong>{accountCount}</strong> Accounts with no recent activity
                </span>
              </li>
            )}
            {!loading && staleCount === 0 && repItems.length === 0 && accountCount === 0 && (
              <li className="text-sm text-muted-foreground">No risk factors identified.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
