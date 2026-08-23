import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFolder } from "@/apis/file.api";
import { toast } from "sonner";

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-folders"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-files"] });
      toast.success("Folder deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete folder.");
    },
  });
};
