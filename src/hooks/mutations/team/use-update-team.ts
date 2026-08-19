import { updateTeam } from "@/apis/team.api";
import type { UpdateTeamRequest } from "@/types/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string;
      data: UpdateTeamRequest;
    }) => updateTeam(teamId, data),

    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Team updated successfully.");

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

      toast.error(response?.message ?? "Failed to update team.");
    },
  });
};
