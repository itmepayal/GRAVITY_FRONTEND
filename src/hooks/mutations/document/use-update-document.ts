import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDocument } from "@/apis/document.api";
import type { UpdateDocumentPayload } from "@/types/document";
import { toast } from "sonner";

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDocumentPayload }) =>
      updateDocument(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
      toast.success("Document updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update document.");
    },
  });
};
