import { NextRequest } from 'next/server';
import { UnauthorizedError, withApiErrorHandling } from '@/lib/api';
import { backtestFiltersSchema, backtestTradeInputSchema } from '@/validators/backtestTrade';
import { backtestTradeService } from '@/services/backtestTradeService';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const filters = backtestFiltersSchema.parse(params);
    return backtestTradeService.list(session.user.id, filters);
  });
}

export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const body = await request.json();
    const input = backtestTradeInputSchema.parse(body);
    return backtestTradeService.create(session.user.id, input);
  });
}
