import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteComment } from "@/apis/task.api";
import { toast } from "sonner";

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      commentId,
    }: {
      taskId: string;
      commentId: string;
    }) => deleteComment(taskId, commentId),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Comment deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: ["task", variables.taskId],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete comment.");
    },
  });
};
