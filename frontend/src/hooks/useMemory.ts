import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface AgentMemoryItem {
  id: string;
  agent_id: string;
  execution_id: string | null;
  summary: string;
  key_outputs: Record<string, any>;
  memory_type: string;
  created_at: string;
}

interface MemoryListResponse {
  memories: AgentMemoryItem[];
  total: number;
}

export function useAgentMemory(agentId: string) {
  return useQuery<MemoryListResponse>({
    queryKey: ['agent-memory', agentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/agents/${agentId}/memory`);
      return data;
    },
    enabled: !!agentId,
  });
}

export function useClearAgentMemory(agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/agents/${agentId}/memory`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory', agentId] });
    },
  });
}
