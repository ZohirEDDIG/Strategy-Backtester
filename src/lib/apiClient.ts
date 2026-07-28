import {
  ApiError,
  BacktestFilters,
  BacktestTradeDTO,
  DashboardResponse,
  PaginatedBacktestTrades,
  StrategyDTO,
  StrategySummary,
} from '@/types/backtest';
import { BacktestTradeInput } from '@/validators/backtestTrade';
import { StrategyInput } from '@/validators/strategy';

async function handleResponse<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    const err = body as ApiError;
    throw new Error(err.error || 'Request failed');
  }
  return body as T;
}

function toQueryString(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  strategies: {
    list: (): Promise<StrategySummary[]> => fetch('/api/strategies').then((r) => handleResponse(r)),

    get: (id: string): Promise<StrategyDTO> =>
      fetch(`/api/strategies/${id}`).then((r) => handleResponse(r)),

    create: (input: StrategyInput): Promise<StrategyDTO> =>
      fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => handleResponse(r)),

    update: (id: string, input: StrategyInput): Promise<StrategyDTO> =>
      fetch(`/api/strategies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => handleResponse(r)),

    delete: (id: string): Promise<{ success: boolean }> =>
      fetch(`/api/strategies/${id}`, { method: 'DELETE' }).then((r) => handleResponse(r)),
  },

  backtests: {
    list: (filters: BacktestFilters): Promise<PaginatedBacktestTrades> =>
      fetch(`/api/backtests${toQueryString(filters)}`).then((r) => handleResponse(r)),

    get: (id: string): Promise<BacktestTradeDTO> =>
      fetch(`/api/backtests/${id}`).then((r) => handleResponse(r)),

    create: (input: BacktestTradeInput): Promise<BacktestTradeDTO> =>
      fetch('/api/backtests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => handleResponse(r)),

    update: (id: string, input: BacktestTradeInput): Promise<BacktestTradeDTO> =>
      fetch(`/api/backtests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((r) => handleResponse(r)),

    delete: (id: string): Promise<{ success: boolean }> =>
      fetch(`/api/backtests/${id}`, { method: 'DELETE' }).then((r) => handleResponse(r)),
  },

  dashboard: {
    get: (filters: Partial<BacktestFilters> = {}): Promise<DashboardResponse> =>
      fetch(`/api/dashboard${toQueryString(filters)}`).then((r) => handleResponse(r)),
  },
};
