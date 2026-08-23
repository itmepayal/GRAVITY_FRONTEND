import { useQuery } from "@tanstack/react-query";
import { listDocuments } from "@/apis/document.api";
import type { ListDocumentsQueryParams } from "@/types/document";

export const useGetWorkspaceDocuments = (params: ListDocumentsQueryParams) => {
  return useQuery({
    queryKey: ["workspace-documents", params],
    queryFn: () => listDocuments(params),
    enabled: !!params.workspace,
  });
};
