import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Integration } from '../types';

export function useIntegrations() {
  return useQuery<Integration[]>({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/integrations');
      return data;
    },
  });
}

export function useConnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { service: string; config: Record<string, string> }) => {
      const { data: result } = await apiClient.post('/integrations', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useDisconnectIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
