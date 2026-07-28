import { NextRequest } from 'next/server';
import { withApiErrorHandling } from '@/lib/api';
import { registerSchema } from '@/validators/auth';
import { authService } from '@/services/authService';

export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const body = await request.json();
    const input = registerSchema.parse(body);
    return authService.register(input);
  });
}
