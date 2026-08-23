import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDocument } from "@/apis/document.api";
import { toast } from "sonner";

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-documents"] });
      toast.success("Document deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete document.");
    },
  });
};
