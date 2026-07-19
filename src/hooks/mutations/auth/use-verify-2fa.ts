import { useMutation } from "@tanstack/react-query";
import { verifyTwoFA } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useVerifyTwoFA = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: verifyTwoFA,

    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.data.accessToken);

      toast.success(data.message);
      navigate("/");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
