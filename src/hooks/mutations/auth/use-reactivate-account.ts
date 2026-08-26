import { useMutation } from "@tanstack/react-query";
import { reactivateAccount } from "@/apis/user.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { ReactivateAccountInput } from "@/types/user";

export const useReactivateAccount = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ReactivateAccountInput) => reactivateAccount(data),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to reactivate account.",
      );
    },
  });
};
