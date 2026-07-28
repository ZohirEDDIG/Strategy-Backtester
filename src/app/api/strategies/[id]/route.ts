import { NextRequest } from 'next/server';
import { NotFoundError, UnauthorizedError, withApiErrorHandling } from '@/lib/api';
import { strategyInputSchema } from '@/validators/strategy';
import { strategyService } from '@/services/strategyService';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const strategy = await strategyService.getById(session.user.id, id);
    if (!strategy) throw new NotFoundError('Strategy not found');
    return strategy;
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const body = await request.json();
    const input = strategyInputSchema.parse(body);
    const strategy = await strategyService.update(session.user.id, id, input);
    if (!strategy) throw new NotFoundError('Strategy not found');
    return strategy;
  });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const { id } = await params;
    const deleted = await strategyService.delete(session.user.id, id);
    if (!deleted) throw new NotFoundError('Strategy not found');
    return { success: true };
  });
}
