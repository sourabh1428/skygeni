import client from './client';
import type {
  SummaryResponse,
  DriversResponse,
  RiskFactorsResponse,
  RevenueTrendResponse,
} from './types';

export async function getSummary(): Promise<SummaryResponse> {
  const { data } = await client.get<SummaryResponse>('/summary');
  return data;
}

export async function getDrivers(): Promise<DriversResponse> {
  const { data } = await client.get<DriversResponse>('/drivers');
  return data;
}

export async function getRiskFactors(): Promise<RiskFactorsResponse> {
  const { data } = await client.get<RiskFactorsResponse>('/risk-factors');
  return data;
}

export async function getRecommendations(): Promise<string[]> {
  const { data } = await client.get<string[]>('/recommendations');
  return data;
}

export async function getRevenueTrend(): Promise<RevenueTrendResponse> {
  const { data } = await client.get<RevenueTrendResponse>('/revenue-trend');
  return data;
}
