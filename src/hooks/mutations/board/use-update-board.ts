import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateBoard } from "@/apis/board.api";
import type { UpdateBoardData } from "@/types/board";

interface UpdateBoardVariables {
  boardId: string;
  data: UpdateBoardData;
}

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, data }: UpdateBoardVariables) =>
      updateBoard(boardId, data),

    onSuccess: (response, variables) => {
      toast.success((response as any).message ?? "Board updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["board", variables.boardId],
      });

      queryClient.invalidateQueries({
        queryKey: ["boards"],
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to update board.");
    },
  });
};
