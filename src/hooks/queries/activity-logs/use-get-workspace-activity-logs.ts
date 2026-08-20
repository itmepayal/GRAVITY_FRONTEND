import {
    getWorkspaceActivityLogs,
    type GetWorkspaceActivityLogsParams,
} from "@/apis/activity-log.api";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceActivityLogs = (
    workspaceId: string,
    params?: GetWorkspaceActivityLogsParams,
) => {
    return useQuery({
        queryKey: ["workspace-activity-logs", workspaceId, params],
        queryFn: () => getWorkspaceActivityLogs(workspaceId, params),
        enabled: !!workspaceId,
    });
};