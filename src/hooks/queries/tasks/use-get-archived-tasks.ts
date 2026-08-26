import { useQuery } from "@tanstack/react-query";
import { getMyTasks } from "@/apis/task.api";
import { useAuthStore } from "@/store/auth.store";

export const useGetArchivedTasks = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthInitialized = useAuthStore((s) => s.isAuthInitialized);

  return useQuery({
    queryKey: ["archived-tasks"],
    queryFn: async () => {
      const response = await getMyTasks({ isArchived: true });
      return response.tasks;
    },
    enabled: isAuthenticated && isAuthInitialized,
  });
};
