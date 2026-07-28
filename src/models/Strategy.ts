import { Schema, model, models, Model, Document } from 'mongoose';

export interface IStrategy extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  defaultSymbol?: string;
  defaultTimeframe?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StrategySchema = new Schema<IStrategy>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 4000 },
    defaultSymbol: { type: String, trim: true },
    defaultTimeframe: { type: String, trim: true },
  },
  { timestamps: true }
);

StrategySchema.index({ userId: 1, name: 1 });

export const Strategy: Model<IStrategy> =
  (models.Strategy as Model<IStrategy>) || model<IStrategy>('Strategy', StrategySchema);
