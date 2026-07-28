'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { FlaskConical, ListTree, LogOut, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ThemeToggle } from '@/components/theme-toggle';

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <FlaskConical size={16} />
          </span>
          <span>Strategy Backtester</span>
        </Link>

        {!isAuthPage && (
          <div className="flex items-center gap-2">
            <Link
              href="/strategies"
              className={cn(
                'hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground sm:flex',
                pathname.startsWith('/strategies') && 'bg-surface-hover text-foreground'
              )}
            >
              <ListTree size={15} />
              Strategies
            </Link>
            <Link
              href="/backtests/new"
              className={cn(
                'hidden items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground',
                'transition-transform hover:brightness-110 active:scale-[0.97] sm:flex'
              )}
            >
              <Plus size={15} />
              Log Backtest
            </Link>
            <ThemeToggle />
            {session?.user && (
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <span className="hidden text-xs text-muted-foreground md:inline">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  aria-label="Sign out"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {!isAuthPage && !pathname.startsWith('/backtests/new') && (
        <Link
          href="/backtests/new"
          className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-soft-lg sm:hidden"
          aria-label="Log a backtest"
        >
          <Plus size={20} />
        </Link>
      )}
    </header>
  );
}
