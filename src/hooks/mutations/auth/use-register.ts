import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { register } from "@/apis/auth.api";
import { toast } from "sonner";

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      console.log(data);
      toast.success(data.message);
      navigate("/verify-email", {
        state: {
          email: data.data.email,
        },
      });
    },
    onError: (error: any) => {
      console.log(error);
      toast.error(error.response?.data?.message ?? "Registration failed");
    },
  });
};
