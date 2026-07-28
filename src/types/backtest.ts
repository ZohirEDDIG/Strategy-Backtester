export const SYMBOLS = [
  'Gold',
  'Silver',
  'Bitcoin',
  'Ethereum',
  'NASDAQ',
  'S&P 500',
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'Other',
] as const;

export const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', 'Daily', 'Weekly'] as const;

export const DIRECTIONS = ['Long', 'Short'] as const;

export const SETUPS = [
  'Breakout',
  'Pullback',
  'Liquidity Sweep',
  'Support & Resistance',
  'Order Block',
  'Fair Value Gap',
  'Trend Continuation',
  'Reversal',
  'Other',
] as const;

/** Whether the trade actually followed the strategy's rules as backtested — key for trusting the results. */
export const ADHERENCE_LEVELS = ['Yes', 'Partial', 'No'] as const;

export type Symbol = (typeof SYMBOLS)[number];
export type Timeframe = (typeof TIMEFRAMES)[number];
export type Direction = (typeof DIRECTIONS)[number];
export type Setup = (typeof SETUPS)[number];
export type Adherence = (typeof ADHERENCE_LEVELS)[number];

export type Outcome = 'win' | 'loss' | 'breakeven';

export interface StrategyDTO {
  id: string;
  name: string;
  description?: string;
  defaultSymbol?: string;
  defaultTimeframe?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrategySummary extends StrategyDTO {
  tradeCount: number;
  winRate: number;
  expectancyR: number;
  profitFactor: number | null;
}

export interface BacktestTradeDTO {
  id: string;
  strategyId: string;
  strategyName?: string;
  date: string;
  symbol: string;
  customSymbol?: string;
  timeframe: string;
  direction: Direction;
  setup: string;
  customSetup?: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  exitPrice: number;
  riskAmount?: number;
  rMultiple: number;
  resultDollars: number | null;
  outcome: Outcome;
  adherence: Adherence;
  notes?: string;
  screenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBacktestTrades {
  data: BacktestTradeDTO[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BacktestFilters {
  strategyId?: string;
  from?: string;
  to?: string;
  symbol?: string;
  setup?: string;
  timeframe?: string;
  direction?: string;
  adherence?: string;
  outcome?: 'win' | 'loss' | 'all';
  sortBy?: 'date' | 'rMultiple' | 'symbol' | 'setup';
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DashboardStats {
  totalBacktests: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: number;
  lossRate: number;
  netR: number;
  grossPositiveR: number;
  grossNegativeR: number;
  averageWinR: number;
  averageLossR: number;
  largestWinR: number;
  largestLossR: number;
  profitFactor: number | null;
  expectancyR: number;
  stdDevR: number;
  currentStreak: { type: 'win' | 'loss' | 'none'; count: number };
  bestWinStreak: number;
  worstLossStreak: number;
  adherenceRate: number;
}

export interface EquityPoint {
  date: string;
  cumulativeR: number;
  rMultiple: number;
}

export interface HistogramBucket {
  label: string;
  count: number;
}

export interface CategoryBreakdown {
  name: string;
  count: number;
  avgR: number;
  winRate: number;
}

export interface StrategyComparisonRow {
  strategyId: string;
  strategyName: string;
  tradeCount: number;
  winRate: number;
  expectancyR: number;
  profitFactor: number | null;
}

export interface AdherenceBreakdown {
  adherence: Adherence;
  count: number;
  avgR: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  equityCurve: EquityPoint[];
  rMultipleHistogram: HistogramBucket[];
  winLossBreakdown: { name: 'Wins' | 'Losses' | 'Breakeven'; value: number }[];
  bySymbol: CategoryBreakdown[];
  bySetup: CategoryBreakdown[];
  byTimeframe: CategoryBreakdown[];
  byStrategy: StrategyComparisonRow[];
  byAdherence: AdherenceBreakdown[];
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
