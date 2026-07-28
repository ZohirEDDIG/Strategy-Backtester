import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/apiClient';
import { StrategyInput } from '@/validators/strategy';

export const strategyKeys = {
  all: ['strategies'] as const,
  detail: (id: string) => [...strategyKeys.all, 'detail', id] as const,
};

export function useStrategies() {
  return useQuery({
    queryKey: strategyKeys.all,
    queryFn: () => api.strategies.list(),
  });
}

export function useStrategy(id: string) {
  return useQuery({
    queryKey: strategyKeys.detail(id),
    queryFn: () => api.strategies.get(id),
    enabled: !!id,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StrategyInput) => api.strategies.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
      toast.success('Strategy created');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not create strategy'),
  });
}

export function useUpdateStrategy(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StrategyInput) => api.strategies.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
      toast.success('Strategy updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update strategy'),
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.strategies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
      toast.success('Strategy deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Could not delete strategy'),
  });
}
