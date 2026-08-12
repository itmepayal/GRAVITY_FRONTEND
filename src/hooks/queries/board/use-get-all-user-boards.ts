import { useQuery } from "@tanstack/react-query";
import { getAllUserBoards } from "@/apis/board.api";

export const useGetAllUserBoards = () => {
    return useQuery({
        queryKey: ["boards"],
        queryFn: getAllUserBoards,
    });
};