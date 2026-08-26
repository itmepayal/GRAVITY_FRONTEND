import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSprint } from "@/apis/project.api";
import { toast } from "sonner";
import type { CreateProjectSprintInput } from "@/types/project";

interface ValidationError {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
}

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateProjectSprintInput;
    }) => createSprint(projectId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message ?? "Sprint created successfully");

      queryClient.invalidateQueries({
        queryKey: ["project-sprints", variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },

    onError: (error) => {
      const response = (error as any).response?.data as ApiErrorResponse;

      if (response?.errors?.length) {
        response.errors.forEach((err) => {
          toast.error(`${err.field}: ${err.message}`);
        });
        return;
      }

      toast.error(response?.message || "Failed to create sprint");
    },
  });
};
