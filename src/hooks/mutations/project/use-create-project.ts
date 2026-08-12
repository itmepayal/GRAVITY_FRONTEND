import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "@/apis/workspace.api";
import { toast } from "sonner";

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: {
        name: string;
        description?: string;
      };
    }) => createProject(workspaceId, data),

    onSuccess: (_, variables) => {
      toast.success("Project created successfully");

      queryClient.invalidateQueries({
        queryKey: ["projects", variables.workspaceId],
      });

      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },

    onError: (error: any) => {
      const errors = error?.response?.data?.errors;

      if (errors?.length > 0) {
        toast.error(errors[0].message);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to create project",
        );
      }
    },
  });
};
