import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useGetInvitationByToken } from "@/hooks/queries/invitation/use-get-invitation-by-token";
import { useJoinViaInviteCode } from "@/hooks/mutations/invitation/use-join-via-invite-code";
import { useAcceptInvitation } from "@/hooks/mutations/invitation/use-accept-invitation";
import { useRejectInvitation } from "@/hooks/mutations/invitation/use-reject-invitation";
import type { PopulatedInvitation } from "@/types/invitation";

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
    data: invitationResponse,
    isLoading,
    isError,
    error,
  } = useGetInvitationByToken(token!);

  const joinMutation = useJoinViaInviteCode();
  const acceptMutation = useAcceptInvitation();
  const rejectMutation = useRejectInvitation();

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
        <Loader2 className="animate-spin text-[#0F8A65]" size={24} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-sm text-red-600 text-center">
          {(error as any)?.response?.data?.message ||
            "Invalid or expired invitation."}
        </p>
      </div>
    );
  }

  const invitation = (invitationResponse as any)?.data as
    | PopulatedInvitation
    | undefined;
  const isEmailInvite = invitation?.type === "email";
  const isPending = acceptMutation.isPending || joinMutation.isPending;

  const handleAccept = () => {
    if (!token) return;

    if (isEmailInvite) {
      acceptMutation.mutate(token, {
        onSuccess: () => navigate("/dashboard"),
      });
      return;
    }

    joinMutation.mutate(token, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  const handleReject = () => {
    if (!token || !isEmailInvite) {
      navigate("/dashboard");
      return;
    }

    rejectMutation.mutate(token, {
      onSuccess: () => navigate("/dashboard"),
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#0F2D29]/10 bg-white p-6 shadow-sm text-center">
        <h2 className="text-xl font-semibold text-[#0F2D29]">
          Join {invitation?.workspace?.name ?? "workspace"}
        </h2>
        <p className="mt-2 text-sm text-[#5B6E68]">
          Invited by {invitation?.invitedBy?.name ?? "a teammate"}
        </p>
        <p className="mt-1 text-xs text-[#5B6E68]">
          Role: {invitation?.role?.name ?? "Member"}
        </p>
        {isEmailInvite && (
          <p className="mt-3 text-xs text-[#5B6E68]">
            This invite was sent to your email address.
          </p>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="bg-[#0F8A65] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isPending
              ? "Joining..."
              : isEmailInvite
                ? "Accept invite"
                : "Join workspace"}
          </button>
          {isEmailInvite && (
            <button
              onClick={handleReject}
              disabled={isPending}
              className="border border-[#0F2D29]/15 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Decline
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
