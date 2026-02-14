import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Sparkline from '@/components/Sparkline';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface DriverCardProps {
  title: string;
  value: string;
  change: string;
  changePositive?: boolean;
  sparklineData: number[];
  sparklineType?: 'area' | 'bar' | 'line';
  loading?: boolean;
  description?: string;
  /** Tooltip label for sparkline values, e.g. "Pipeline", "Win rate" */
  metricLabel?: string;
  /** Optional x-axis labels for tooltips, e.g. ["M1", "M2", ...] */
  sparklineXLabels?: string[];
}

export default function DriverCard({
  title,
  value,
  change,
  changePositive = true,
  sparklineData,
  sparklineType = 'area',
  loading = false,
  description,
  metricLabel,
  sparklineXLabels,
}: DriverCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        className="cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onClick={() => !loading && setOpen(true)}
        onKeyDown={(e) => {
          if (!loading && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-1 h-8 w-24" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          )}
          {loading ? (
            <Skeleton className="mt-1 h-4 w-12" />
          ) : (
            <p
              className={
                changePositive ? 'mt-1 text-sm font-medium text-emerald-600' : 'mt-1 text-sm font-medium text-red-600'
              }
            >
              {change}
            </p>
          )}
          <div className="mt-3 h-9 w-full">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Sparkline
                data={sparklineData}
                type={sparklineType}
                className="h-full w-full"
                metricLabel={metricLabel}
                xLabels={sparklineXLabels}
              />
            )}
          </div>
          {!loading && (
            <p className="mt-2 text-xs text-muted-foreground">Click for details</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)} className="max-w-sm sm:max-w-md">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          <div className="py-2">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p
              className={
                changePositive ? 'mt-1 text-sm font-medium text-emerald-600' : 'mt-1 text-sm font-medium text-red-600'
              }
            >
              {change}
            </p>
          </div>
          <div className="h-32 w-full rounded-lg border border-border bg-muted/30 p-2">
            {sparklineData.length > 0 && (
              <Sparkline
                data={sparklineData}
                type={sparklineType}
                width={320}
                height={120}
                className="h-full w-full"
                metricLabel={metricLabel}
                xLabels={sparklineXLabels}
              />
            )}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
