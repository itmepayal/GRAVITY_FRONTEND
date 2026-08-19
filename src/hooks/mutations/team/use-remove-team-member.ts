import { removeTeamMember } from "@/apis/team.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),

    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Team member removed successfully.");

      queryClient.invalidateQueries({
        queryKey: ["team", variables.teamId],
      });

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

      toast.error(response?.message ?? "Failed to remove team member.");
    },
  });
};
