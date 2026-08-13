import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/apis/task.api";
import { toast } from "sonner";

import type { TaskResponse } from "@/types/task";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<TaskResponse, Error, FormData>({
    mutationFn: (data) => createTask(data),

    onSuccess: () => {
      toast.success("Task created successfully");

      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create task");
    },
  });
};
