import { Schema, model, models, Model, Document } from 'mongoose';

export interface IBacktestTrade extends Document {
  userId: Schema.Types.ObjectId;
  strategyId: Schema.Types.ObjectId;
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
  // Denormalized so the trade list/dashboard can sort and filter at the
  // database level instead of recomputing R for every trade on every read.
  // Always recalculated from entry/stop/exit in the repository on
  // create/update, so it can never drift from the prices it's derived from.
  rMultiple: number;
  adherence: 'Yes' | 'Partial' | 'No';
  notes?: string;
  screenshotUrl?: string;
  // --- Future-proofing ---------------------------------------------------
  // Not needed yet, but the DTO/service layering means these can be added
  // without touching route handlers:
  //   tags?: string[];
  //   positionSize?: number;
  //   commissions?: number;
  //   marketConditionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BacktestTradeSchema = new Schema<IBacktestTrade>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'User' },
    strategyId: { type: Schema.Types.ObjectId, required: true, index: true, ref: 'Strategy' },
    date: { type: Date, required: true, index: true },
    symbol: { type: String, required: true, index: true },
    customSymbol: { type: String, trim: true },
    timeframe: { type: String, required: true, index: true },
    direction: { type: String, required: true, enum: ['Long', 'Short'] },
    setup: { type: String, required: true, index: true },
    customSetup: { type: String, trim: true },
    entryPrice: { type: Number, required: true },
    stopLoss: { type: Number, required: true },
    takeProfit: { type: Number },
    exitPrice: { type: Number, required: true },
    riskAmount: { type: Number },
    rMultiple: { type: Number, required: true },
    adherence: { type: String, required: true, enum: ['Yes', 'Partial', 'No'] },
    notes: { type: String, trim: true, maxlength: 5000 },
    screenshotUrl: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

BacktestTradeSchema.index({ userId: 1, date: -1, strategyId: 1, symbol: 1, setup: 1 });

export const BacktestTrade: Model<IBacktestTrade> =
  (models.BacktestTrade as Model<IBacktestTrade>) ||
  model<IBacktestTrade>('BacktestTrade', BacktestTradeSchema);
