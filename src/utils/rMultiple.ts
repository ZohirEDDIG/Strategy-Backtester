import { Direction, Outcome } from '@/types/backtest';

/**
 * R-multiple = how many "units of risk" a trade made or lost.
 * Risk (1R) is the distance from entry to stop; the result is how many of
 * those units the exit price ended up moving in your favor (or against you).
 *
 *   Long:  R = (exit - entry) / (entry - stop)
 *   Short: R = (entry - exit) / (stop - entry)
 *
 * Both denominators are defined to be positive by the validator (stop must
 * be on the risk side of entry), so this never divides by zero or flips
 * sign unexpectedly.
 */
export function calculateRMultiple(params: {
  direction: Direction;
  entryPrice: number;
  stopLoss: number;
  exitPrice: number;
}): number {
  const { direction, entryPrice, stopLoss, exitPrice } = params;

  const risk = direction === 'Long' ? entryPrice - stopLoss : stopLoss - entryPrice;
  if (risk <= 0) {
    // Should be unreachable if validation ran first, but never divide by a
    // non-positive risk — that would produce a meaningless or infinite R.
    return 0;
  }

  const reward = direction === 'Long' ? exitPrice - entryPrice : entryPrice - exitPrice;
  return reward / risk;
}

export function outcomeFromR(rMultiple: number): Outcome {
  if (rMultiple > 0) return 'win';
  if (rMultiple < 0) return 'loss';
  return 'breakeven';
}

export function resultDollarsFromR(rMultiple: number, riskAmount?: number): number | null {
  if (riskAmount === undefined || riskAmount === null) return null;
  return rMultiple * riskAmount;
}
