import { useQuery } from "@tanstack/react-query";
import { getReportById } from "@/apis/report.api";

export const useGetReportById = (reportId: string) => {
  return useQuery({
    queryKey: ["report", reportId],
    queryFn: () => getReportById(reportId),
    enabled: !!reportId,
  });
};
