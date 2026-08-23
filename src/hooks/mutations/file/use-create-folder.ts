import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFolder } from "@/apis/file.api";
import type { CreateFolderData } from "@/types/file";
import { toast } from "sonner";

export const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFolderData) => createFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-folders"] });
      toast.success("Folder created successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create folder.");
    },
  });
};
