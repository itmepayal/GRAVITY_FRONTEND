import { useQuery } from "@tanstack/react-query";
import { getBoardById } from "@/apis/board.api";

export const useGetBoardById = (boardId: string) => {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId),
    enabled: !!boardId,
  });
};
