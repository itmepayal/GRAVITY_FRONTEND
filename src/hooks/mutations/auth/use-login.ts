import { useMutation } from "@tanstack/react-query";
import { login } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      toast.success(data.message);
      localStorage.setItem("accessToken", data.data.accessToken);
      navigate("/");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Login failed");
    },
  });
};
