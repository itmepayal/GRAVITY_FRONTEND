import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTimeEntry } from "@/apis/time-entry.api";
import type { CreateTimeEntryInput } from "@/apis/time-entry.api";
import { toast } from "sonner";

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeEntryInput) => createTimeEntry(data),
    onSuccess: () => {
      toast.success("Time entry logged successfully");
      queryClient.invalidateQueries({
        queryKey: ["time-entries"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to log time entry",
      );
    },
  });
};
