import { createTeam } from "@/apis/team.api";
import type { CreateTeamRequest } from "@/types/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string;
      data: CreateTeamRequest;
    }) => createTeam(workspaceId, data),

    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Team created successfully.");

      queryClient.invalidateQueries({
        queryKey: ["workspace-teams", variables.workspaceId],
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

      toast.error(response?.message ?? "Failed to create team.");
    },
  });
};