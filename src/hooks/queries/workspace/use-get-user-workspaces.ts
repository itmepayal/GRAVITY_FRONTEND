import { useQuery } from "@tanstack/react-query";
import { getUserWorkspaces } from "@/apis/workspace.api";

export const useGetUserWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: getUserWorkspaces,
  });
};
