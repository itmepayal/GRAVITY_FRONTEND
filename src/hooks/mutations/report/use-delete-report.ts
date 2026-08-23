import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteReport } from "@/apis/report.api";
import { toast } from "sonner";

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-reports"] });
      toast.success("Report deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete report.");
    },
  });
};
