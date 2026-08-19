import { deleteWorkspaceRole } from "@/apis/role.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteWorkspaceRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      roleId,
    }: {
      workspaceId: string;
      roleId: string;
    }) => deleteWorkspaceRole(workspaceId, roleId),

    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Role deleted successfully.");

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

      toast.error(response?.message ?? "Failed to delete role.");
    },
  });
};
