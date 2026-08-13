import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSprint } from "@/apis/sprint.api";
import type { UpdateSprintData } from "@/types/sprint";
import { toast } from "sonner";

export const useUpdateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sprintId,
      data,
    }: {
      sprintId: string;
      data: UpdateSprintData;
    }) => updateSprint(sprintId, data),

    onSuccess: (response, variables) => {
      toast.success(response.message || "Sprint updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["sprint", variables.sprintId],
      });

      queryClient.invalidateQueries({
        queryKey: ["project-sprints"],
      });

      queryClient.invalidateQueries({
        queryKey: ["project"],
      });
    },

    onError: (error: any) => {
      const errors = error?.response?.data?.errors;

      if (errors?.length) {
        errors.forEach((err: { field: string; message: string }) => {
          toast.error(`${err.field}: ${err.message}`);
        });

        return;
      }

      toast.error(error?.response?.data?.message || "Failed to update sprint");
    },
  });
};
