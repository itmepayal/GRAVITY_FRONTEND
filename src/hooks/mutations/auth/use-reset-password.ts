import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: resetPassword,

    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
