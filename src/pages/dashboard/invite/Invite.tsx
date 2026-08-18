import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useParams, useNavigate } from "react-router-dom";
import { useGetInvitationByToken } from "@/hooks/queries/invitation/use-get-invitation-by-token";
import { useJoinViaInviteCode } from "@/hooks/mutations/invitation/use-join-via-invite-code";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/invite/${token}`, { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  const {
    data: invitation,
    isLoading,
    isError,
    error,
  } = useGetInvitationByToken(token!);

  const joinMutation = useJoinViaInviteCode();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">Loading invitation...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-red-600">
          {(error as any)?.response?.data?.message ||
            "Invalid or expired invitation."}
        </p>
      </div>
    );
  }

  const handleAccept = () => {
    if (!token) return;
    joinMutation.mutate(token, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  const handleReject = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-xl font-semibold">
        You've been invited to join {(invitation as any)?.workspace?.name}
      </h2>
      <p>Invited by {(invitation as any)?.invitedBy?.name}</p>

      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          disabled={joinMutation.isPending}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {joinMutation.isPending ? "Joining..." : "Accept"}
        </button>
        <button
          onClick={handleReject}
          disabled={joinMutation.isPending}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
