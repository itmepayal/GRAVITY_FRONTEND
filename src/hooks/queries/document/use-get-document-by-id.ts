import { useQuery } from "@tanstack/react-query";
import { getDocumentById } from "@/apis/document.api";

export const useGetDocumentById = (id: string) => {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocumentById(id),
    enabled: !!id,
  });
};
