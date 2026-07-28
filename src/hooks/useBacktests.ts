import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/apiClient';
import { BacktestFilters } from '@/types/backtest';
import { BacktestTradeInput } from '@/validators/backtestTrade';
import { strategyKeys } from '@/hooks/useStrategies';

export const backtestKeys = {
  all: ['backtests'] as const,
  lists: () => [...backtestKeys.all, 'list'] as const,
  list: (filters: BacktestFilters) => [...backtestKeys.lists(), filters] as const,
  details: () => [...backtestKeys.all, 'detail'] as const,
  detail: (id: string) => [...backtestKeys.details(), id] as const,
  dashboard: (filters: Partial<BacktestFilters>) => ['dashboard', filters] as const,
};

export function useBacktests(filters: BacktestFilters) {
  return useQuery({
    queryKey: backtestKeys.list(filters),
    queryFn: () => api.backtests.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useBacktest(id: string) {
  return useQuery({
    queryKey: backtestKeys.detail(id),
    queryFn: () => api.backtests.get(id),
    enabled: !!id,
  });
}

function invalidateAfterMutation(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: backtestKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  // A backtest's R-multiple feeds each strategy's summary stats too.
  queryClient.invalidateQueries({ queryKey: strategyKeys.all });
}

export function useCreateBacktest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BacktestTradeInput) => api.backtests.create(input),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
      toast.success('Backtest logged');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not log this backtest'),
  });
}

export function useUpdateBacktest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BacktestTradeInput) => api.backtests.update(id, input),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
      toast.success('Backtest updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update this backtest'),
  });
}

export function useDeleteBacktest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.backtests.delete(id),
    onSuccess: () => {
      invalidateAfterMutation(queryClient);
      toast.success('Backtest deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not delete this backtest'),
  });
}

export function useDashboard(filters: Partial<BacktestFilters> = {}) {
  return useQuery({
    queryKey: backtestKeys.dashboard(filters),
    queryFn: () => api.dashboard.get(filters),
  });
}
