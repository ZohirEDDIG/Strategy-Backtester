import { strategyRepository } from '@/repositories/strategyRepository';
import { backtestTradeRepository } from '@/repositories/backtestTradeRepository';
import { computeStats } from '@/services/statsCalculator';
import { StrategyInput } from '@/validators/strategy';
import { StrategyDTO, StrategySummary } from '@/types/backtest';
import { IStrategy } from '@/models/Strategy';
import { ConflictError } from '@/lib/api';

type LeanStrategy = IStrategy & { _id: unknown };

function toStrategyDTO(strategy: LeanStrategy): StrategyDTO {
  return {
    id: String(strategy._id),
    name: strategy.name,
    description: strategy.description,
    defaultSymbol: strategy.defaultSymbol,
    defaultTimeframe: strategy.defaultTimeframe,
    createdAt: new Date(strategy.createdAt).toISOString(),
    updatedAt: new Date(strategy.updatedAt).toISOString(),
  };
}

export const strategyService = {
  async list(userId: string): Promise<StrategySummary[]> {
    const strategies = await strategyRepository.findAll(userId);
    const allTrades = await backtestTradeRepository.findAllForStats(userId);

    return (strategies as unknown as LeanStrategy[]).map((strategy) => {
      const strategyId = String(strategy._id);
      const strategyTrades = allTrades.filter((t) => String(t.strategyId) === strategyId);
      const stats = computeStats(strategyTrades);

      return {
        ...toStrategyDTO(strategy),
        tradeCount: stats.totalBacktests,
        winRate: stats.winRate,
        expectancyR: stats.expectancyR,
        profitFactor: stats.profitFactor,
      };
    });
  },

  async getById(userId: string, id: string): Promise<StrategyDTO | null> {
    const strategy = await strategyRepository.findById(userId, id);
    if (!strategy) return null;
    return toStrategyDTO(strategy as unknown as LeanStrategy);
  },

  async create(userId: string, input: StrategyInput): Promise<StrategyDTO> {
    const strategy = await strategyRepository.create(userId, input);
    return toStrategyDTO(strategy.toObject() as LeanStrategy);
  },

  async update(userId: string, id: string, input: StrategyInput): Promise<StrategyDTO | null> {
    const strategy = await strategyRepository.update(userId, id, input);
    if (!strategy) return null;
    return toStrategyDTO(strategy as unknown as LeanStrategy);
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const tradeCount = await backtestTradeRepository.countByStrategy(userId, id);
    if (tradeCount > 0) {
      throw new ConflictError(
        `This strategy has ${tradeCount} logged backtest${tradeCount === 1 ? '' : 's'} — delete or reassign them first.`
      );
    }
    const strategy = await strategyRepository.delete(userId, id);
    return !!strategy;
  },
};
