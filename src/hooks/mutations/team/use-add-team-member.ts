import { addTeamMember } from "@/apis/team.api";
import type { AddTeamMemberRequest } from "@/types/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string;
      data: AddTeamMemberRequest;
    }) => addTeamMember(teamId, data),

    onSuccess: (data, variables) => {
      toast.success(data.message ?? "Team member added successfully.");

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

      toast.error(response?.message ?? "Failed to add team member.");
    },
  });
};
