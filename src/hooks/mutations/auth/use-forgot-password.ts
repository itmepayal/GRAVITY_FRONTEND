import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: forgotPassword,

    onSuccess: (data, variables) => {
      toast.success(data.message);

      navigate("/reset-password", {
        state: {
          email: variables.email,
        },
      });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
