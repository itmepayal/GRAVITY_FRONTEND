import { useMutation } from "@tanstack/react-query";
import { logout } from "@/apis/auth.api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,

    onSuccess: (data) => {
      localStorage.removeItem("accessToken");

      toast.success(data.message);
      navigate("/login");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
};
