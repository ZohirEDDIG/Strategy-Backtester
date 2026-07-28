import { backtestTradeRepository } from '@/repositories/backtestTradeRepository';
import { BacktestFiltersInput, BacktestTradeInput } from '@/validators/backtestTrade';
import { BacktestTradeDTO, PaginatedBacktestTrades } from '@/types/backtest';
import { outcomeFromR, resultDollarsFromR } from '@/utils/rMultiple';

// After .populate('strategyId', 'name').lean(), strategyId is replaced with
// a plain object (or stays an ObjectId if the referenced doc is missing).
interface PopulatedStrategyRef {
  _id: unknown;
  name: string;
}

interface LeanTradeWithPopulatedStrategy {
  _id: unknown;
  strategyId: PopulatedStrategyRef | unknown;
  date: Date;
  symbol: string;
  customSymbol?: string;
  timeframe: string;
  direction: 'Long' | 'Short';
  setup: string;
  customSetup?: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  exitPrice: number;
  riskAmount?: number;
  rMultiple: number;
  adherence: 'Yes' | 'Partial' | 'No';
  notes?: string;
  screenshotUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

function isPopulatedStrategy(ref: unknown): ref is PopulatedStrategyRef {
  return !!ref && typeof ref === 'object' && 'name' in ref;
}

export function toBacktestTradeDTO(trade: LeanTradeWithPopulatedStrategy): BacktestTradeDTO {
  const strategyRef = trade.strategyId;
  const strategyId = isPopulatedStrategy(strategyRef) ? String(strategyRef._id) : String(strategyRef);
  const strategyName = isPopulatedStrategy(strategyRef) ? strategyRef.name : undefined;

  return {
    id: String(trade._id),
    strategyId,
    strategyName,
    date: new Date(trade.date).toISOString(),
    symbol: trade.symbol,
    customSymbol: trade.customSymbol,
    timeframe: trade.timeframe,
    direction: trade.direction,
    setup: trade.setup,
    customSetup: trade.customSetup,
    entryPrice: trade.entryPrice,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    exitPrice: trade.exitPrice,
    riskAmount: trade.riskAmount,
    rMultiple: Math.round(trade.rMultiple * 100) / 100,
    resultDollars: resultDollarsFromR(trade.rMultiple, trade.riskAmount),
    outcome: outcomeFromR(trade.rMultiple),
    adherence: trade.adherence,
    notes: trade.notes,
    screenshotUrl: trade.screenshotUrl,
    createdAt: new Date(trade.createdAt).toISOString(),
    updatedAt: new Date(trade.updatedAt).toISOString(),
  };
}

export const backtestTradeService = {
  async list(userId: string, filters: BacktestFiltersInput): Promise<PaginatedBacktestTrades> {
    const { data, total, page, pageSize } = await backtestTradeRepository.findMany(userId, filters);
    return {
      data: (data as unknown as LeanTradeWithPopulatedStrategy[]).map(toBacktestTradeDTO),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(userId: string, id: string): Promise<BacktestTradeDTO | null> {
    const trade = await backtestTradeRepository.findById(userId, id);
    if (!trade) return null;
    return toBacktestTradeDTO(trade as unknown as LeanTradeWithPopulatedStrategy);
  },

  async create(userId: string, input: BacktestTradeInput): Promise<BacktestTradeDTO> {
    const trade = await backtestTradeRepository.create(userId, input);
    // .create() doesn't populate — re-fetch so the response carries strategyName too.
    const withStrategy = await backtestTradeRepository.findById(userId, String(trade._id));
    return toBacktestTradeDTO(withStrategy as unknown as LeanTradeWithPopulatedStrategy);
  },

  async update(userId: string, id: string, input: BacktestTradeInput): Promise<BacktestTradeDTO | null> {
    const trade = await backtestTradeRepository.update(userId, id, input);
    if (!trade) return null;
    return toBacktestTradeDTO(trade as unknown as LeanTradeWithPopulatedStrategy);
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const trade = await backtestTradeRepository.delete(userId, id);
    return !!trade;
  },
};
