import { changeTeamLead } from "@/apis/team.api";
import type { ChangeTeamLeadRequest } from "@/types/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useChangeTeamLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string;
      data: ChangeTeamLeadRequest;
    }) => changeTeamLead(teamId, data),

    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Team lead changed successfully.");

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

      toast.error(response?.message ?? "Failed to change team lead.");
    },
  });
};
