import { useQuery } from "@tanstack/react-query";
import { getWorkspaceFolders } from "@/apis/file.api";
import type { GetWorkspaceFoldersParams } from "@/types/file";

export const useGetWorkspaceFolders = (
  workspaceId: string,
  params?: GetWorkspaceFoldersParams,
) => {
  return useQuery({
    queryKey: ["workspace-folders", workspaceId, params],
    queryFn: () => getWorkspaceFolders(workspaceId, params),
    enabled: !!workspaceId,
  });
};
