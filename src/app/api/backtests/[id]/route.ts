import { NextRequest } from 'next/server';
import { NotFoundError, UnauthorizedError, withApiErrorHandling } from '@/lib/api';
import { backtestTradeInputSchema } from '@/validators/backtestTrade';
import { backtestTradeService } from '@/services/backtestTradeService';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const trade = await backtestTradeService.getById(session.user.id, id);
    if (!trade) throw new NotFoundError('Backtest trade not found');
    return trade;
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const body = await request.json();
    const input = backtestTradeInputSchema.parse(body);
    const trade = await backtestTradeService.update(session.user.id, id, input);
    if (!trade) throw new NotFoundError('Backtest trade not found');
    return trade;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const deleted = await backtestTradeService.delete(session.user.id, id);
    if (!deleted) throw new NotFoundError('Backtest trade not found');
    return { success: true };
  });
}
