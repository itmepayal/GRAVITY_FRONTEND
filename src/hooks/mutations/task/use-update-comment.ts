import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComment } from "@/apis/task.api";
import type { CommentData } from "@/types/task";
import { toast } from "sonner";

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      commentId,
      data,
    }: {
      taskId: string;
      commentId: string;
      data: CommentData;
    }) => updateComment(taskId, commentId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Comment updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update comment.");
    },
  });
};
