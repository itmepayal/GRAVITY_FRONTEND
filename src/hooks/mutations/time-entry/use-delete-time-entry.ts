import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTimeEntry } from "@/apis/time-entry.api";
import { toast } from "sonner";

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTimeEntry(id),
    onSuccess: () => {
      toast.success("Time entry deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["time-entries"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete time entry",
      );
    },
  });
};
