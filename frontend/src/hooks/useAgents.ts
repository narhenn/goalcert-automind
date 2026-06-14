import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Agent, AgentTemplate } from '../types';

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data } = await apiClient.get('/agents');
      return data;
    },
  });
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: ['agents', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/agents/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useTemplates() {
  return useQuery<AgentTemplate[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await apiClient.get('/templates');
      return data;
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; type: string; description?: string; template_id?: string }) => {
      const { data: result } = await apiClient.post('/agents', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/stats');
      return data;
    },
  });
}

export function useDashboardActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/activity');
      return data;
    },
  });
}
