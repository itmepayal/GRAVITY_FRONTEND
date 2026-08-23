import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFile } from "@/apis/file.api";
import { toast } from "sonner";

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-files"] });
      toast.success("File deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete file.");
    },
  });
};
