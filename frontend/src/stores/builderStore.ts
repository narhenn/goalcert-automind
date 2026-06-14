import { create } from 'zustand';

interface BuilderState {
  selectedNodeId: string | null;
  isDirty: boolean;
  setSelectedNode: (nodeId: string | null) => void;
  setDirty: (dirty: boolean) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  selectedNodeId: null,
  isDirty: false,
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setDirty: (dirty) => set({ isDirty: dirty }),
}));
