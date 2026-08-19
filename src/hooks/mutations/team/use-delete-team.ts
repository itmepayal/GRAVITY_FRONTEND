import { deleteTeam } from "@/apis/team.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,

    onSuccess: (data) => {
      toast.success(data.message ?? "Team deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: ["workspace-teams"],
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

      toast.error(response?.message ?? "Failed to delete team.");
    },
  });
};
