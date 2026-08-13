import { useQuery } from "@tanstack/react-query";
import { getBoardTasks } from "@/apis/task.api";

export const useGetBoardTasks = (boardId: string) => {
  return useQuery({
    queryKey: ["board-tasks", boardId],
    queryFn: () => getBoardTasks(boardId),
    enabled: !!boardId,
  });
};
