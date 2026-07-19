import { useMutation } from "@tanstack/react-query";
import { verifyEmail } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useVerifyEmail = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyEmail,

    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
