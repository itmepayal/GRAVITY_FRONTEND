import { useQuery } from "@tanstack/react-query";
import { getWorkspaceFiles } from "@/apis/file.api";
import type { GetWorkspaceFilesParams } from "@/types/file";

export const useGetWorkspaceFiles = (
  workspaceId: string,
  params?: GetWorkspaceFilesParams,
) => {
  return useQuery({
    queryKey: ["workspace-files", workspaceId, params],
    queryFn: () => getWorkspaceFiles(workspaceId, params),
    enabled: !!workspaceId,
  });
};
