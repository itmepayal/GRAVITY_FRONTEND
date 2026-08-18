import { create } from "zustand";
import { persist } from "zustand/middleware";

type WorkspaceStore = {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (workspaceId: string) => void;
  clearWorkspace: () => void;
};

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,

      setCurrentWorkspaceId: (workspaceId) =>
        set({
          currentWorkspaceId: workspaceId,
        }),

      clearWorkspace: () =>
        set({
          currentWorkspaceId: null,
        }),
    }),
    {
      name: "workspace-storage",
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    },
  ),
);
