import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSprint } from "@/apis/project.api";
import { toast } from "sonner";

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: {
        name: string;
        goal?: string;
        startDate: string;
        endDate: string;
      };
    }) => createSprint(projectId, data),

    onSuccess: (_, variables) => {
      toast.success("Sprint created successfully");

      queryClient.invalidateQueries({
        queryKey: ["project-sprints", variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create sprint");
    },
  });
};
