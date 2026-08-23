import { useMutation } from "@tanstack/react-query";
import { exportReport } from "@/apis/report.api";
import type { ReportFormat } from "@/types/report";
import { toast } from "sonner";

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format?: ReportFormat }) =>
      exportReport(reportId, format),
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${filename} successfully.`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to export report.");
    },
  });
};
