import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Edge-safe: uses only the pages/callbacks config, not the Credentials
// provider (which needs Mongoose + bcrypt and can't run on the Edge runtime).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Runs on every page request except API routes, static assets, and the
  // favicon. API routes protect themselves individually (see src/lib/api.ts
  // usage in each route handler) so they can return 401 JSON instead of an
  // HTML redirect.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
