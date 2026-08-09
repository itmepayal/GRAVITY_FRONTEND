import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBoard } from "@/apis/project.api";

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: {
        name: string;
        description?: string;
      };
    }) => createBoard(projectId, data),

    onSuccess: (_, variables) => {
      toast.success("Board created successfully");

      queryClient.invalidateQueries({
        queryKey: ["project-boards", variables.projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create board");
    },
  });
};
