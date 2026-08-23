import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/apis/file.api";
import { toast } from "sonner";

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadFile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-files"] });
      toast.success("File uploaded successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload file.");
    },
  });
};
