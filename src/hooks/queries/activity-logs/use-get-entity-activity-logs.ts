import {
    getEntityActivityLogs,
    type ActivityEntityType,
    type PaginationParams,
} from "@/apis/activity-log.api";
import { useQuery } from "@tanstack/react-query";

export const useGetEntityActivityLogs = (
    entityType: ActivityEntityType,
    entityId: string,
    params?: PaginationParams,
) => {
    return useQuery({
        queryKey: [
            "entity-activity-logs",
            entityType,
            entityId,
            params,
        ],
        queryFn: () =>
            getEntityActivityLogs(entityType, entityId, params),
        enabled: !!entityType && !!entityId,
    });
};