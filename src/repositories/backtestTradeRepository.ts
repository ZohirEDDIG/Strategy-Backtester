import { FilterQuery, SortOrder } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { BacktestTrade, IBacktestTrade } from '@/models/BacktestTrade';
import { BacktestFiltersInput, BacktestTradeInput } from '@/validators/backtestTrade';
import { calculateRMultiple } from '@/utils/rMultiple';

function buildFilterQuery(
  userId: string,
  filters: Partial<BacktestFiltersInput>
): FilterQuery<IBacktestTrade> {
  const query: FilterQuery<IBacktestTrade> = { userId };

  if (filters.strategyId) query.strategyId = filters.strategyId;
  if (filters.from || filters.to) {
    query.date = {};
    if (filters.from) query.date.$gte = new Date(filters.from);
    if (filters.to) query.date.$lte = new Date(filters.to);
  }
  if (filters.symbol) query.symbol = filters.symbol;
  if (filters.setup) query.setup = filters.setup;
  if (filters.timeframe) query.timeframe = filters.timeframe;
  if (filters.direction) query.direction = filters.direction;
  if (filters.adherence) query.adherence = filters.adherence;
  if (filters.outcome === 'win') query.rMultiple = { $gt: 0 };
  if (filters.outcome === 'loss') query.rMultiple = { $lt: 0 };

  return query;
}

function withComputedR(input: BacktestTradeInput) {
  const rMultiple = calculateRMultiple({
    direction: input.direction,
    entryPrice: input.entryPrice,
    stopLoss: input.stopLoss,
    exitPrice: input.exitPrice,
  });
  return { ...input, date: new Date(input.date), rMultiple };
}

export const backtestTradeRepository = {
  async findMany(userId: string, filters: BacktestFiltersInput) {
    await connectToDatabase();
    const query = buildFilterQuery(userId, filters);

    const sortField = filters.sortBy ?? 'date';
    const sortDir: SortOrder = filters.sortDir === 'asc' ? 1 : -1;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;

    const [data, total] = await Promise.all([
      BacktestTrade.find(query)
        .populate('strategyId', 'name')
        .sort({ [sortField]: sortDir })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      BacktestTrade.countDocuments(query),
    ]);

    return { data, total, page, pageSize };
  },

  /** Unpaginated — feeds the dashboard's stats and charts. */
  async findAllForStats(userId: string, filters: Partial<BacktestFiltersInput> = {}) {
    await connectToDatabase();
    const query = buildFilterQuery(userId, filters);
    return BacktestTrade.find(query).populate('strategyId', 'name').sort({ date: 1 }).lean();
  },

  async findById(userId: string, id: string) {
    await connectToDatabase();
    return BacktestTrade.findOne({ _id: id, userId }).populate('strategyId', 'name').lean();
  },

  async create(userId: string, input: BacktestTradeInput) {
    await connectToDatabase();
    return BacktestTrade.create({ ...withComputedR(input), userId });
  },

  async update(userId: string, id: string, input: BacktestTradeInput) {
    await connectToDatabase();
    return BacktestTrade.findOneAndUpdate({ _id: id, userId }, withComputedR(input), {
      new: true,
      runValidators: true,
    })
      .populate('strategyId', 'name')
      .lean();
  },

  async delete(userId: string, id: string) {
    await connectToDatabase();
    return BacktestTrade.findOneAndDelete({ _id: id, userId }).lean();
  },

  /** Used when deleting a strategy, to decide whether to block or cascade. */
  async countByStrategy(userId: string, strategyId: string) {
    await connectToDatabase();
    return BacktestTrade.countDocuments({ userId, strategyId });
  },
};
