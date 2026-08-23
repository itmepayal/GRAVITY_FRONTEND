import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReport } from "@/apis/report.api";
import type { CreateReportPayload } from "@/types/report";
import { toast } from "sonner";

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportPayload) => createReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-reports"] });
      toast.success("Report generated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to generate report.");
    },
  });
};
