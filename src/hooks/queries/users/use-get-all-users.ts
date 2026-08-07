import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/apis/user.api";

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });
};
