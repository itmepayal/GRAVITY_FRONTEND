import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { revokeSession, revokeOtherSessions } from "@/apis/settings.api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: (sessionId: number) =>
      revokeSession(sessionId, refreshToken ?? undefined),
    onSuccess: (data) => {
      if (data.data.isCurrentSession) {
        clearAuth();
        queryClient.clear();
        toast.success("Signed out from this device.");
        navigate("/login", { replace: true });
        return;
      }

      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to revoke session.",
      );
    },
  });
};

export const useRevokeOtherSessions = () => {
  const queryClient = useQueryClient();
  const refreshToken = useAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: () => {
      if (!refreshToken) {
        throw new Error("No active session found.");
      }
      return revokeOtherSessions(refreshToken);
    },
    onSuccess: (data) => {
      toast.success(
        data.data.revokedCount > 0
          ? `Signed out from ${data.data.revokedCount} other device(s).`
          : "No other active sessions found.",
      );
      queryClient.invalidateQueries({ queryKey: ["auth-sessions"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to revoke other sessions.",
      );
    },
  });
};
