import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Execution, ExecutionNodeLog } from '../types';

export function useExecutions(agentId: string, poll = false) {
  return useQuery<Execution[]>({
    queryKey: ['executions', agentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/agents/${agentId}/executions`);
      return data;
    },
    enabled: !!agentId,
    refetchInterval: poll ? 2000 : false,
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

export function useExecutionWithLogs(executionId: string | null, poll = false) {
  return useQuery<{ execution: Execution; node_logs: ExecutionNodeLog[] }>({
    queryKey: ['execution-detail', executionId],
    queryFn: async () => {
      const [execRes, logsRes] = await Promise.all([
        apiClient.get(`/executions/${executionId}`),
        apiClient.get(`/executions/${executionId}/logs`),
      ]);
      return {
        execution: execRes.data,
        node_logs: logsRes.data,
      };
    },
    enabled: !!executionId,
    refetchInterval: poll ? 2000 : false,
  });
}

export function useLatestExecutionLogs(agentId: string) {
  return useQuery<{ execution: Execution; node_logs: ExecutionNodeLog[] } | null>({
    queryKey: ['latest-exec-logs', agentId],
    queryFn: async () => {
      const { data: executions } = await apiClient.get(`/agents/${agentId}/executions?limit=1`);
      if (!executions || executions.length === 0) return null;
      const execId = executions[0].id;
      const [execRes, logsRes] = await Promise.all([
        apiClient.get(`/executions/${execId}`),
        apiClient.get(`/executions/${execId}/logs`),
      ]);
      return {
        execution: execRes.data,
        node_logs: logsRes.data,
      };
    },
    enabled: !!agentId,
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
