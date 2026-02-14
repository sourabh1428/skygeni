import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  type?: 'area' | 'bar' | 'line';
  className?: string;
  /** Label for tooltip, e.g. "Pipeline" or "Win rate" */
  metricLabel?: string;
  /** Optional label for x-axis points, e.g. ["Sep", "Oct", ...] */
  xLabels?: string[];
}

function formatValue(value: number, label?: string): string {
  if (label?.toLowerCase().includes('rate') || label?.toLowerCase().includes('win')) {
    return `${value.toFixed(1)}%`;
  }
  if (label?.toLowerCase().includes('cycle') || label?.toLowerCase().includes('days')) {
    return `${Math.round(value)} days`;
  }
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value.toFixed(0)}`;
}

export default function Sparkline({
  data,
  width = 120,
  height = 36,
  type = 'area',
  className = '',
  metricLabel,
  xLabels,
}: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const min = Math.min(...data);
    const max = Math.max(...data);
    const padding = (max - min) * 0.1 || 1;
    const yMin = min - padding;
    const yMax = max + padding;

    const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

    const svg = d3.select(svgRef.current).attr('viewBox', `0 0 ${width} ${height}`);

    const showTooltip = (event: { clientX: number; clientY: number }, i: number, value: number) => {
      const container = containerRef.current?.getBoundingClientRect();
      if (!container) return;
      const xLabel = xLabels?.[i] ?? `Point ${i + 1}`;
      const content = `${xLabel}: ${formatValue(value, metricLabel)}`;
      setTooltip({
        x: event.clientX - container.left,
        y: event.clientY - container.top - 8,
        content,
      });
    };

    if (type === 'area') {
      const area = d3
        .area<number>()
        .x((_, i) => xScale(i))
        .y0(height)
        .y1((d) => yScale(d));
      svg
        .append('path')
        .datum(data)
        .attr('fill', 'hsl(199 89% 28% / 0.2)')
        .attr('d', area);
      const path = svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(199 89% 28%)')
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr(
          'd',
          d3
            .line<number>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d))
        )
        .style('cursor', 'pointer');
      path.on('mousemove', function (event) {
        const ev = event as unknown as { offsetX: number; clientX: number; clientY: number };
        const i = Math.round((ev.offsetX / width) * (data.length - 1));
        const clamped = Math.max(0, Math.min(i, data.length - 1));
        showTooltip(ev, clamped, data[clamped]);
      });
      path.on('mouseleave', () => setTooltip(null));
    } else if (type === 'bar') {
      const barWidth = Math.max(2, (width / data.length) * 0.6);
      const bars = svg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (_, i) => xScale(i) - barWidth / 2)
        .attr('y', (d) => yScale(d))
        .attr('width', barWidth)
        .attr('height', (d) => height - yScale(d))
        .attr('fill', 'hsl(199 89% 28%)')
        .attr('rx', 2)
        .style('cursor', 'pointer');
      bars
        .on('mouseenter', function (event, d) {
          const ev = event as unknown as { clientX: number; clientY: number };
          const i = data.indexOf(d);
          showTooltip(ev, i, d);
        })
        .on('mouseleave', () => setTooltip(null));
    } else {
      const path = svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'hsl(25 95% 53%)')
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr(
          'd',
          d3
            .line<number>()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d))
        )
        .style('cursor', 'pointer');
      path.on('mousemove', function (event) {
        const ev = event as unknown as { offsetX: number; clientX: number; clientY: number };
        const i = Math.round((ev.offsetX / width) * (data.length - 1));
        const clamped = Math.max(0, Math.min(i, data.length - 1));
        showTooltip(ev, clamped, data[clamped]);
      });
      path.on('mouseleave', () => setTooltip(null));
    }
  }, [data, width, height, type, metricLabel, xLabels]);

  if (data.length === 0) return <div className={className} style={{ width, height }} />;
  return (
    <div ref={containerRef} className="relative inline-block" style={{ width, height }}>
      <svg ref={svgRef} width={width} height={height} className={className} />
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
