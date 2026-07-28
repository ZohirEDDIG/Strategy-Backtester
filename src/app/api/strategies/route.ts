import { NextRequest } from 'next/server';
import { UnauthorizedError, withApiErrorHandling } from '@/lib/api';
import { strategyInputSchema } from '@/validators/strategy';
import { strategyService } from '@/services/strategyService';
import { auth } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();
    return strategyService.list(session.user.id);
  });
}

export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const session = await auth();
    if (!session?.user) throw new UnauthorizedError();

    const body = await request.json();
    const input = strategyInputSchema.parse(body);
    return strategyService.create(session.user.id, input);
  });
}
