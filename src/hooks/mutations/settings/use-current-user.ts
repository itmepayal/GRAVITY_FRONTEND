import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/apis/user.api";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });
};
