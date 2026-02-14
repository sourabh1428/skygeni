import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { RevenueTrendResponse } from '@/api/types';

const WIDTH = 640;
const HEIGHT = 280;
const MARGIN = { top: 24, right: 24, bottom: 40, left: 56 };

function formatRevenue(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

export default function RevenueTrendCombinedChart({
  data,
  loading,
  error,
}: {
  data: RevenueTrendResponse | null;
  loading: boolean;
  error?: string | null;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.months.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`);
    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
    const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

    const xScale = d3
      .scaleBand()
      .domain(data.months)
      .range([0, innerWidth])
      .padding(0.35);

    const allVals = [...data.revenue, ...(data.target ?? [])].filter(Number.isFinite);
    const maxVal = allVals.length > 0 ? Math.max(...allVals, 1) : 1;
    const yScale = d3.scaleLinear().domain([0, maxVal * 1.15]).range([innerHeight, 0]);

    const bars = g
      .selectAll('rect')
      .data(data.months)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d) ?? 0)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', (_, i) => (i % 2 === 0 ? 'hsl(199 89% 28% / 0.85)' : 'hsl(199 89% 38% / 0.95)'))
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'pointer');

    bars
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr('y', (_, i) => yScale(data.revenue[i] ?? 0))
      .attr('height', (_, i) => innerHeight - yScale(data.revenue[i] ?? 0));

    bars
      .on('mouseenter', function (event, month) {
        const i = data.months.indexOf(month);
        const rev = data.revenue[i] ?? 0;
        const rect = (event.target as SVGRectElement).getBoundingClientRect();
        const container = containerRef.current?.getBoundingClientRect();
        if (container) {
          setTooltip({
            x: rect.left - container.left + rect.width / 2,
            y: rect.top - container.top - 8,
            content: `${month}: Revenue ${formatRevenue(rev)}`,
          });
        }
      })
      .on('mouseleave', () => setTooltip(null));

    const lineData = data.months.map((m, i) => ({
      month: m,
      value: data.target?.[i] ?? data.revenue[i],
      isTarget: (data.target?.[i] ?? 0) > 0,
    }));
    const line = d3
      .line<{ month: string; value: number }>()
      .x((d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.value));

    g.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', 'hsl(25 95% 53%)')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    const circles = g
      .selectAll('circle.trend-dot')
      .data(lineData)
      .enter()
      .append('circle')
      .attr('class', 'trend-dot')
      .attr('cx', (d) => (xScale(d.month) ?? 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 0)
      .attr('fill', 'hsl(25 95% 53%)')
      .style('cursor', 'pointer');

    circles
      .transition()
      .delay(400)
      .duration(200)
      .attr('r', 5);

    circles
      .on('mouseenter', function (event, d) {
        const rect = (event.target as SVGCircleElement).getBoundingClientRect();
        const container = containerRef.current?.getBoundingClientRect();
        if (container) {
          setTooltip({
            x: rect.left - container.left + rect.width / 2,
            y: rect.top - container.top - 8,
            content: `${d.month}: ${d.isTarget ? 'Target' : 'Revenue'} ${formatRevenue(d.value)}`,
          });
        }
      })
      .on('mouseleave', () => setTooltip(null));

    const xAxis = d3.axisBottom(xScale).tickSize(0);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', 'hsl(215 16% 47%)');

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((v) => `$${Number(v) / 1000}k`)
      .tickSize(0);
    g.append('g').call(yAxis).selectAll('text').attr('fill', 'hsl(215 16% 47%)');
    g.selectAll('.domain, .tick line').attr('stroke', 'hsl(214 32% 91%)');
  }, [data]);

  if (error) {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 p-4 text-center">
        <p className="font-medium text-foreground">Could not load revenue trend</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="text-xs text-muted-foreground">
          Start the backend: <code className="rounded bg-muted px-1 py-0.5">cd backend &amp;&amp; npm run dev</code>
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground" style={{ height: HEIGHT }}>
        Loading…
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-[280px] w-full" style={{ height: HEIGHT }}>
      <svg
        ref={svgRef}
        width="100%"
        height={HEIGHT}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded bg-foreground px-2 py-1 text-xs text-primary-foreground shadow-md"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
