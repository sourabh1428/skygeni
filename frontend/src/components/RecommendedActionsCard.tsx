import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecommendedActionsCard() {
  const { data, loading, error } = useRecommendations();

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col p-4">
        <h2 className="mb-4 text-base font-semibold text-foreground">Recommended Actions</h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <ul className="space-y-3">
            {(data ?? []).map((text, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  ✓
                </span>
                <span className="text-sm font-medium text-foreground">{text}</span>
              </li>
            ))}
            {(!data?.length && !loading) && (
              <li className="text-sm text-muted-foreground">No recommendations.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
