import { useEffect, useMemo } from "react";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";

type UseSyncedWorkspaceOptions = {
  allowAll?: boolean;
};

export function useSyncedWorkspace(options?: UseSyncedWorkspaceOptions) {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspaceStore();
  const { data: workspacesResponse, isLoading } = useGetUserWorkspaces();

  const workspaces = useMemo(() => {
    const raw = Array.isArray(workspacesResponse)
      ? workspacesResponse
      : (workspacesResponse?.data ?? []);

    return raw.map((workspace: any) => ({
      ...workspace,
      id: workspace.id ?? workspace._id,
      _id: workspace._id ?? workspace.id,
    }));
  }, [workspacesResponse]);

  useEffect(() => {
    if (isLoading || workspaces.length === 0) return;
    if (options?.allowAll && currentWorkspaceId === "all") return;

    const isValid = workspaces.some(
      (workspace: { id?: string; _id?: string }) =>
        workspace.id === currentWorkspaceId ||
        workspace._id === currentWorkspaceId,
    );

    if (!currentWorkspaceId || !isValid) {
      setCurrentWorkspaceId(workspaces[0].id ?? workspaces[0]._id);
    }
  }, [
    workspaces,
    currentWorkspaceId,
    isLoading,
    setCurrentWorkspaceId,
    options?.allowAll,
  ]);

  const resolvedWorkspaceId =
    options?.allowAll && currentWorkspaceId === "all"
      ? "all"
      : (currentWorkspaceId ?? workspaces[0]?.id ?? workspaces[0]?._id ?? "");

  const updateWorkspaceId = (workspaceId: string) => {
    if (options?.allowAll && workspaceId === "all") {
      setCurrentWorkspaceId("all");
      return;
    }
    setCurrentWorkspaceId(workspaceId);
  };

  return {
    workspaces,
    currentWorkspaceId: resolvedWorkspaceId,
    setCurrentWorkspaceId: updateWorkspaceId,
    isLoadingWorkspaces: isLoading,
  };
}
