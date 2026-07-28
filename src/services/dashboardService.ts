import { backtestTradeRepository } from '@/repositories/backtestTradeRepository';
import { computeStats } from '@/services/statsCalculator';
import {
  AdherenceBreakdown,
  CategoryBreakdown,
  DashboardResponse,
  EquityPoint,
  HistogramBucket,
  StrategyComparisonRow,
} from '@/types/backtest';
import { BacktestFiltersInput } from '@/validators/backtestTrade';

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface LeanTrade {
  date: Date;
  rMultiple: number;
  symbol: string;
  setup: string;
  timeframe: string;
  adherence: string;
  strategyId: unknown;
}

function strategyRefToNamePair(ref: unknown): { id: string; name: string } {
  if (ref && typeof ref === 'object' && 'name' in ref) {
    const populated = ref as { _id: unknown; name: string };
    return { id: String(populated._id), name: populated.name };
  }
  return { id: String(ref), name: 'Unknown strategy' };
}

function computeEquityCurve(trades: LeanTrade[]): EquityPoint[] {
  let cumulative = 0;
  return trades.map((t) => {
    cumulative += t.rMultiple;
    return {
      date: new Date(t.date).toISOString(),
      cumulativeR: round2(cumulative),
      rMultiple: round2(t.rMultiple),
    };
  });
}

const HISTOGRAM_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: '< -3R', min: -Infinity, max: -3 },
  { label: '-3R to -2R', min: -3, max: -2 },
  { label: '-2R to -1R', min: -2, max: -1 },
  { label: '-1R to 0R', min: -1, max: 0 },
  { label: '0R to 1R', min: 0, max: 1 },
  { label: '1R to 2R', min: 1, max: 2 },
  { label: '2R to 3R', min: 2, max: 3 },
  { label: '> 3R', min: 3, max: Infinity },
];

function computeHistogram(trades: LeanTrade[]): HistogramBucket[] {
  return HISTOGRAM_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: trades.filter((t) => t.rMultiple >= bucket.min && t.rMultiple < bucket.max).length,
  }));
}

function computeBreakdown(trades: LeanTrade[], field: 'symbol' | 'setup' | 'timeframe'): CategoryBreakdown[] {
  const map = new Map<string, LeanTrade[]>();
  for (const t of trades) {
    const key = t[field];
    const bucket = map.get(key) ?? [];
    bucket.push(t);
    map.set(key, bucket);
  }
  return Array.from(map.entries())
    .map(([name, group]) => {
      const stats = computeStats(group);
      return { name, count: group.length, avgR: stats.expectancyR, winRate: stats.winRate };
    })
    .sort((a, b) => b.count - a.count);
}

function computeStrategyComparison(trades: LeanTrade[]): StrategyComparisonRow[] {
  const map = new Map<string, { name: string; trades: LeanTrade[] }>();
  for (const t of trades) {
    const { id, name } = strategyRefToNamePair(t.strategyId);
    const entry = map.get(id) ?? { name, trades: [] };
    entry.trades.push(t);
    map.set(id, entry);
  }
  return Array.from(map.entries())
    .map(([strategyId, { name, trades: group }]) => {
      const stats = computeStats(group);
      return {
        strategyId,
        strategyName: name,
        tradeCount: group.length,
        winRate: stats.winRate,
        expectancyR: stats.expectancyR,
        profitFactor: stats.profitFactor,
      };
    })
    .sort((a, b) => b.tradeCount - a.tradeCount);
}

function computeAdherenceBreakdown(trades: LeanTrade[]): AdherenceBreakdown[] {
  const levels: Array<'Yes' | 'Partial' | 'No'> = ['Yes', 'Partial', 'No'];
  return levels
    .map((adherence) => {
      const group = trades.filter((t) => t.adherence === adherence);
      const stats = computeStats(group);
      return { adherence, count: group.length, avgR: stats.expectancyR };
    })
    .filter((row) => row.count > 0);
}

export const dashboardService = {
  async getDashboard(
    userId: string,
    filters: Partial<BacktestFiltersInput> = {}
  ): Promise<DashboardResponse> {
    const trades = (await backtestTradeRepository.findAllForStats(userId, filters)) as unknown as LeanTrade[];

    const stats = computeStats(trades);
    const equityCurve = computeEquityCurve(trades);
    const rMultipleHistogram = computeHistogram(trades);
    const winLossBreakdown: DashboardResponse['winLossBreakdown'] = [
      { name: 'Wins', value: stats.wins },
      { name: 'Losses', value: stats.losses },
      { name: 'Breakeven', value: stats.breakevens },
    ];
    const bySymbol = computeBreakdown(trades, 'symbol');
    const bySetup = computeBreakdown(trades, 'setup');
    const byTimeframe = computeBreakdown(trades, 'timeframe');
    const byStrategy = computeStrategyComparison(trades);
    const byAdherence = computeAdherenceBreakdown(trades);

    return {
      stats,
      equityCurve,
      rMultipleHistogram,
      winLossBreakdown,
      bySymbol,
      bySetup,
      byTimeframe,
      byStrategy,
      byAdherence,
    };
  },
};
