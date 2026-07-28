import { DashboardStats } from '@/types/backtest';

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface HasR {
  rMultiple: number;
  adherence?: string;
}

/** Trades must be sorted by date ascending for streaks to be meaningful. */
export function computeStats(trades: HasR[]): DashboardStats {
  const total = trades.length;
  const wins = trades.filter((t) => t.rMultiple > 0);
  const losses = trades.filter((t) => t.rMultiple < 0);
  const breakevens = trades.filter((t) => t.rMultiple === 0);

  const grossPositiveR = wins.reduce((sum, t) => sum + t.rMultiple, 0);
  const grossNegativeR = losses.reduce((sum, t) => sum + t.rMultiple, 0); // negative
  const netR = grossPositiveR + grossNegativeR;

  const averageWinR = wins.length ? grossPositiveR / wins.length : 0;
  const averageLossR = losses.length ? grossNegativeR / losses.length : 0;

  const largestWinR = wins.length ? Math.max(...wins.map((t) => t.rMultiple)) : 0;
  const largestLossR = losses.length ? Math.min(...losses.map((t) => t.rMultiple)) : 0;

  const winRate = total ? (wins.length / total) * 100 : 0;
  const lossRate = total ? (losses.length / total) * 100 : 0;

  const profitFactor = grossNegativeR !== 0 ? Math.abs(grossPositiveR / grossNegativeR) : null;
  const expectancyR = total ? netR / total : 0;

  const mean = expectancyR;
  const variance = total
    ? trades.reduce((sum, t) => sum + (t.rMultiple - mean) ** 2, 0) / total
    : 0;
  const stdDevR = Math.sqrt(variance);

  let currentStreakType: 'win' | 'loss' | 'none' = 'none';
  let currentStreakCount = 0;
  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let runningWin = 0;
  let runningLoss = 0;

  for (const t of trades) {
    if (t.rMultiple > 0) {
      runningWin += 1;
      runningLoss = 0;
      bestWinStreak = Math.max(bestWinStreak, runningWin);
    } else if (t.rMultiple < 0) {
      runningLoss += 1;
      runningWin = 0;
      worstLossStreak = Math.max(worstLossStreak, runningLoss);
    } else {
      runningWin = 0;
      runningLoss = 0;
    }
  }
  if (trades.length) {
    const last = trades[trades.length - 1];
    if (last.rMultiple > 0) {
      currentStreakType = 'win';
      currentStreakCount = runningWin;
    } else if (last.rMultiple < 0) {
      currentStreakType = 'loss';
      currentStreakCount = runningLoss;
    }
  }

  const adherenceEligible = trades.filter((t) => t.adherence !== undefined);
  const adherenceYes = adherenceEligible.filter((t) => t.adherence === 'Yes');
  const adherenceRate = adherenceEligible.length
    ? (adherenceYes.length / adherenceEligible.length) * 100
    : 0;

  return {
    totalBacktests: total,
    wins: wins.length,
    losses: losses.length,
    breakevens: breakevens.length,
    winRate: round2(winRate),
    lossRate: round2(lossRate),
    netR: round2(netR),
    grossPositiveR: round2(grossPositiveR),
    grossNegativeR: round2(grossNegativeR),
    averageWinR: round2(averageWinR),
    averageLossR: round2(averageLossR),
    largestWinR: round2(largestWinR),
    largestLossR: round2(largestLossR),
    profitFactor: profitFactor !== null ? round2(profitFactor) : null,
    expectancyR: round2(expectancyR),
    stdDevR: round2(stdDevR),
    currentStreak: { type: currentStreakType, count: currentStreakCount },
    bestWinStreak,
    worstLossStreak,
    adherenceRate: round2(adherenceRate),
  };
}
