import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Execution, ExecutionNodeLog } from '../types';

export function useExecutions(agentId: string) {
  return useQuery<Execution[]>({
    queryKey: ['executions', agentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/agents/${agentId}/executions`);
      return data;
    },
    enabled: !!agentId,
  });
}

export function useExecution(
  executionId: string,
  options?: Partial<UseQueryOptions<Execution>>,
) {
  return useQuery<Execution>({
    queryKey: ['execution', executionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/executions/${executionId}`);
      return data;
    },
    enabled: !!executionId,
    ...options,
  });
}

export function useExecutionLogs(
  executionId: string,
  options?: Partial<UseQueryOptions<ExecutionNodeLog[]>>,
) {
  return useQuery<ExecutionNodeLog[]>({
    queryKey: ['execution-logs', executionId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/executions/${executionId}/logs`);
      return data;
    },
    enabled: !!executionId,
    ...options,
  });
}

export function useTriggerExecution(agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/agents/${agentId}/execute`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
