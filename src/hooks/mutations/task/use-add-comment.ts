import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment } from "@/apis/task.api";
import type { CommentData } from "@/types/task";
import { toast } from "sonner";

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: CommentData }) =>
      addComment(taskId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Comment added successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add comment.");
    },
  });
};
