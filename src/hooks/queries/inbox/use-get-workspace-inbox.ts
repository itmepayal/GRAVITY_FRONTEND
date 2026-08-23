import { useQuery } from "@tanstack/react-query";
import { listInbox } from "@/apis/inbox.api";
import type { ListInboxQueryParams } from "@/types/inbox";

export const useGetWorkspaceInbox = (params: ListInboxQueryParams) => {
  return useQuery({
    queryKey: ["user-inbox", params],
    queryFn: () => listInbox(params),
  });
};
