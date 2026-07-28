import type { NextAuthConfig } from 'next-auth';

// This config is imported by middleware.ts, which runs on the Edge runtime —
// so it must stay free of Node-only code (Mongoose, bcrypt). The actual
// Credentials provider (which needs both) lives in auth.ts and spreads this
// config in, so pages/callbacks/session behavior stay in one place.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicPath = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';

      if (isPublicPath) {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts
};
