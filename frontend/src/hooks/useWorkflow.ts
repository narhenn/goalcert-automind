import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Workflow } from '../types';

export function useWorkflow(agentId: string) {
  return useQuery<Workflow>({
    queryKey: ['workflow', agentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/agents/${agentId}/workflow`);
      return data;
    },
    enabled: !!agentId,
  });
}

export function useSaveWorkflow(agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (definition: unknown) => {
      const { data } = await apiClient.put(`/agents/${agentId}/workflow`, { definition });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', agentId] });
    },
  });
}

export function useDeployWorkflow(agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/agents/${agentId}/workflow/deploy`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
