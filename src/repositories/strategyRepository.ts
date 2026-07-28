import { connectToDatabase } from '@/lib/mongodb';
import { Strategy } from '@/models/Strategy';
import { StrategyInput } from '@/validators/strategy';

export const strategyRepository = {
  async findAll(userId: string) {
    await connectToDatabase();
    return Strategy.find({ userId }).sort({ name: 1 }).lean();
  },

  async findById(userId: string, id: string) {
    await connectToDatabase();
    return Strategy.findOne({ _id: id, userId }).lean();
  },

  async create(userId: string, input: StrategyInput) {
    await connectToDatabase();
    return Strategy.create({ ...input, userId });
  },

  async update(userId: string, id: string, input: StrategyInput) {
    await connectToDatabase();
    return Strategy.findOneAndUpdate({ _id: id, userId }, input, {
      new: true,
      runValidators: true,
    }).lean();
  },

  async delete(userId: string, id: string) {
    await connectToDatabase();
    return Strategy.findOneAndDelete({ _id: id, userId }).lean();
  },
};
