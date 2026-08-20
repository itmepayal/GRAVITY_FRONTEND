import {
    createActivityLog,
    type CreateActivityLogData,
} from "@/apis/activity-log.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateActivityLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateActivityLogData) =>
            createActivityLog(data),

        onSuccess: (_, variables) => {
            toast.success("Activity log created successfully.");

            queryClient.invalidateQueries({
                queryKey: [
                    "workspace-activity-logs",
                    variables.workspace,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "entity-activity-logs",
                    variables.entityType,
                    variables.entityId,
                ],
            });
        },

        onError: (error: any) => {
            const response = error.response?.data;

            if (response?.errors?.length) {
                response.errors.forEach(
                    (err: { field?: string; message?: string }) => {
                        toast.error(
                            err.field
                                ? `${err.field}: ${err.message}`
                                : err.message ?? "Validation error",
                        );
                    },
                );
                return;
            }
            toast.error(
                response?.message ?? "Failed to create activity log.",
            );
        },
    });
};