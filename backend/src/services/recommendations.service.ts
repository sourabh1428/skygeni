import { getRiskFactors, type RiskFactorsResponse } from './risk-factors.service';
import { getDrivers } from './drivers.service';

export async function getRecommendations(): Promise<string[]> {
  const [riskFactors, drivers] = await Promise.all([
    getRiskFactors(),
    getDrivers(),
  ]);
  return buildRecommendations(riskFactors, drivers);
}

function buildRecommendations(risk: RiskFactorsResponse, drivers: { winRate: number }): string[] {
  const recommendations: string[] = [];

  if (risk.staleDeals.length > 0) {
    const segments = new Set<string>();
    risk.staleDeals.forEach((d) => {
      if (d.name && d.name.length > 0) segments.add(d.name);
    });
    const dealLabel = risk.staleDeals.length === 1 ? 'deal' : 'deals';
    recommendations.push(
      `Focus on ${risk.staleDeals.length} stale ${dealLabel} older than 30 days (e.g. ${risk.staleDeals[0]?.name ?? 'open deals'})`
    );
  }

  risk.underperformingReps.forEach((rep) => {
    recommendations.push(`Coach ${rep.name} on win rate (current: ${rep.winRate.toFixed(1)}%)`);
  });

  if (risk.lowActivityAccounts.length > 0) {
    const bySegment = new Map<string, number>();
    risk.lowActivityAccounts.forEach((a) => {
      const seg = a.segment ?? 'Unknown';
      bySegment.set(seg, (bySegment.get(seg) ?? 0) + 1);
    });
    const topSegment = [...bySegment.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topSegment) {
      recommendations.push(`Increase activity for ${topSegment[0]} segment (${topSegment[1]} accounts with no activity in last 14 days)`);
    }
  }

  if (drivers.winRate < 50 && recommendations.length < 5) {
    recommendations.push('Consider team-wide win rate improvement initiatives');
  }

  if (recommendations.length === 0) {
    recommendations.push('No specific risk factors identified; maintain current execution.');
  }

  return recommendations.slice(0, 5);
}
