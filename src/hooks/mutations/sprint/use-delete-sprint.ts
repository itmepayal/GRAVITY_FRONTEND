import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSprint } from "@/apis/sprint.api";
import { toast } from "sonner";

export const useDeleteSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => deleteSprint(sprintId),

    onSuccess: (response) => {
      toast.success(response.message || "Sprint deleted successfully");

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

      toast.error(error?.response?.data?.message || "Failed to delete sprint");
    },
  });
};
