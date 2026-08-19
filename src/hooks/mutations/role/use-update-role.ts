import { updateWorkspaceRole } from "@/apis/role.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateWorkspaceRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      roleId,
      data,
    }: {
      workspaceId: string;
      roleId: string;
      data: {
        name?: string;
        permissions?: string[];
      };
    }) => updateWorkspaceRole(workspaceId, roleId, data),

    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Role updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["workspace-roles", variables.workspaceId],
      });
    },

    onError: (error: any) => {
      const response = error.response?.data;

      if (response?.errors?.length) {
        response.errors.forEach(
          (err: { field?: string; message?: string }) => {
            toast.error(
              err.field
                ? `${err.field}: ${err.message}`
                : err.message ?? "Validation error",
            );
          },
        );
        return;
      }

      toast.error(response?.message ?? "Failed to update role.");
    },
  });
};
