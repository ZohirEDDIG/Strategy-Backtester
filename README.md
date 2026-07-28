# Strategy Backtester

A personal tool for manually backtesting trading strategies: review historical
charts yourself, log what would have happened, and see win rate, expectancy,
and R-multiple distribution per strategy — clearly, without spreadsheet math.

This is a separate app from the trading journal, with its own login and
database. Nothing here is shared with it.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · MongoDB Atlas · Mongoose ·
React Hook Form + Zod · TanStack Query · Recharts · NextAuth (Auth.js) v5

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in MONGODB_URI and AUTH_SECRET — see below
npm run dev
```

Open http://localhost:3000, register an account, create a strategy, then log
your first backtest against it.

### Environment variables

```bash
# MongoDB Atlas connection string
MONGODB_URI=

# Generate with: npx auth secret   (or: openssl rand -base64 32)
AUTH_SECRET=
```

## Why R-multiples instead of dollars

Backtesting is about validating a strategy's edge, not one account's P&L.
A trade's result is expressed as an **R-multiple** — how many "units of risk"
it made or lost, based on the distance from entry to stop:

```
Long:  R = (exit − entry) / (entry − stop)
Short: R = (entry − exit) / (stop − entry)
```

This is computed automatically from the entry/stop/exit prices you enter
(see `src/utils/rMultiple.ts`) — you never type in the result directly, so it
can't drift out of sync with the prices it's based on. A dollar-equivalent
result is still shown wherever you optionally provide a risk amount, but
every stat and chart is calculated in R so strategies with different position
sizes or account sizes remain directly comparable.

## Core concepts

- **Strategy** — the thing being tested: a name, optional default
  symbol/timeframe, and a free-text rules description. Write the rules down
  before you start testing; it's what makes the **adherence** field below
  meaningful later.
- **Backtest trade** — one simulated trade against a strategy: date, symbol,
  timeframe, direction, entry/stop/take-profit/exit prices, setup tag, notes,
  and an optional chart screenshot link.
- **Adherence** (Yes/Partial/No) — did this result actually follow the
  strategy's rules, or was it a deviation? This is the biggest difference
  from a live trading journal: a backtest is only trustworthy if you're
  honest about which results reflect the actual rules. The dashboard's
  "Does Following the Plan Matter?" chart shows average R by adherence level,
  so a strategy that only "works" when you bend the rules becomes visible
  immediately.

## What the dashboard shows

- Stats: win rate, expectancy per trade, profit factor, average win/loss,
  streaks, R standard deviation (consistency), and plan adherence rate
- Equity curve in cumulative R
- **R-multiple distribution histogram** — where your results actually cluster,
  not just the average
- Win/loss/breakeven split
- By-setup and by-timeframe breakdowns (count, win rate, average R)
- **Strategy comparison** — expectancy side-by-side across every strategy
  with logged backtests, so you can see which one actually has an edge
- Adherence-vs-results chart

Each strategy's detail page (`/strategies/:id`) shows the same equity curve
and histogram scoped to just that strategy, plus its backtest log.

## Architecture

```
src/
  app/
    api/            Route Handlers — thin, delegate to services
    strategies/     Strategy list, detail (scoped stats + log), new, edit
    backtests/      new/[id]/[id]/edit — logging and reviewing individual backtests
  components/
    ui/             Generic primitives (Button, Card, Input, ConfirmDialog...)
    strategies/     Strategy form and summary card
    backtests/      Backtest form (with live R-multiple preview), table, filters
    dashboard/      Stat cards and every chart
  lib/              MongoDB connection, NextAuth config, API error helper, fetch client
  models/           Mongoose schemas: User, Strategy, BacktestTrade
  repositories/     Raw data access — the only layer that talks to Mongoose
  services/         DTO mapping, statistics (statsCalculator.ts is shared by
                    the dashboard and each strategy's summary card)
  validators/       Zod schemas — shared by the client form and the API routes
  types/            Shared TypeScript types/DTOs
  hooks/            TanStack Query hooks
  utils/            R-multiple math, formatting, className helpers
```

Every `BacktestTrade` and `Strategy` is scoped by `userId` at the repository
layer, so one account can never see or modify another's data — same pattern
as the trading journal.

## Extending later

- **Tags, commissions, position sizing**: add to `models/BacktestTrade.ts`,
  `types/backtest.ts`, and `validators/backtestTrade.ts` — the DTO mapping in
  `backtestTradeService.ts` means new fields reach the UI without route
  handler changes.
- **CSV import** (e.g. from a spreadsheet you were already using): add
  `app/api/backtests/import/route.ts` that parses rows and calls
  `backtestTradeService.create()` per row — validation and R-calculation
  logic doesn't change.
- **Chart image upload** instead of a pasted link: swap `screenshotUrl` for
  actual file storage (e.g. S3/Cloudinary) and update the form's field —
  everything downstream (DTO, table, detail page) already just renders
  whatever URL it's given.
- **Promoting a backtested strategy to live trading**: since this is a
  separate app from the trading journal by design, there's no built-in link
  between the two — you'd manually start logging real trades there once a
  strategy tests well here.

## Deployment (Vercel)

1. Push to a Git repo and import it in Vercel.
2. Add `MONGODB_URI` and `AUTH_SECRET` in the project's environment variables
   (Production and Preview).
3. Deploy. The MongoDB connection helper (`src/lib/mongodb.ts`) caches the
   connection across serverless invocations, so no extra config is needed.
