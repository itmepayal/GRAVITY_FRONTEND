import { getAllPermissions } from "@/apis/role.api";
import { useQuery } from "@tanstack/react-query";

export const useGetAllPermissions = () => {
  return useQuery({
    queryKey: ["all-permissions"],
    queryFn: getAllPermissions,
    staleTime: Infinity, // Permissions list is static, no need to refetch often
  });
};
