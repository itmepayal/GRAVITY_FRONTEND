import { useMutation } from "@tanstack/react-query";
import { reactivateAccount } from "@/apis/user.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { ReactivateAccountInput } from "@/types/user";

type UseReactivateAccountOptions = {
  redirectOnSuccess?: boolean;
};

export const useReactivateAccount = (
  options: UseReactivateAccountOptions = {},
) => {
  const navigate = useNavigate();
  const { redirectOnSuccess = true } = options;

  return useMutation({
    mutationFn: (data: ReactivateAccountInput) => reactivateAccount(data),
    onSuccess: (data) => {
      toast.success(
        data.message ?? "Account reactivated successfully. You can log in now.",
      );
      if (redirectOnSuccess) {
        navigate("/login");
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? "Failed to reactivate account.",
      );
    },
  });
};
