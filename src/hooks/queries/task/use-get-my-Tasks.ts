import { useQuery } from "@tanstack/react-query";
import { getMyTasks } from "@/apis/task.api";

export const useGetMyTasks = () => {
  return useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => getMyTasks(),
  });
};
