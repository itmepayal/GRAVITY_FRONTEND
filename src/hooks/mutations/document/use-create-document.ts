import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDocument } from "@/apis/document.api";
import type { CreateDocumentPayload } from "@/types/document";
import { toast } from "sonner";

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => createDocument(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-documents"] });
      toast.success("Document created successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create document.");
    },
  });
};
