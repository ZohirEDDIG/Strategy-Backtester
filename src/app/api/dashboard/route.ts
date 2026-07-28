import { NextRequest } from 'next/server';
import { UnauthorizedError, withApiErrorHandling } from '@/lib/api';
import { dashboardService } from '@/services/dashboardService';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    return dashboardService.getDashboard(session.user.id, {
      strategyId: params.strategyId,
      from: params.from,
      to: params.to,
      symbol: params.symbol,
      setup: params.setup,
      timeframe: params.timeframe,
      direction: params.direction,
      adherence: params.adherence,
    });
  });
}
