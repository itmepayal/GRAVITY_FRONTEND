import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteBoard } from "@/apis/board.api";

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),

    onSuccess: (data, boardId) => {
      toast.success(data.message ?? "Board deleted successfully.");

      queryClient.removeQueries({
        queryKey: ["board", boardId],
      });

      queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to delete board.");
    },
  });
};
