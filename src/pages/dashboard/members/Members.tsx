import { useState } from "react";
import {
  Mail,
  MoreHorizontal,
  UserPlus,
  X,
  Loader2,
  Trash2,
  Clock,
  Link as LinkIcon,
  Copy,
  Check,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useGetWorkspaceById } from "@/hooks/queries/workspace/use-get-workspace-by-id";
import { useGetWorkspaceRoles } from "@/hooks/queries/workspace/use-get-workspace-roles";
import { useGetWorkspaceInvitations } from "@/hooks/queries/invitation/use-get-workspace-invitations";
import { useCreateEmailInvitation } from "@/hooks/mutations/invitation/use-create-email-invitation";
import { useCreateInviteLink } from "@/hooks/mutations/invitation/use-create-invite-link";
import { useRevokeInvitation } from "@/hooks/mutations/invitation/use-revoke-invitation";
import { useUpdateWorkspaceMemberRole } from "@/hooks/mutations/workspace/update-workspace-member-role";
import { useRemoveWorkspaceMember } from "@/hooks/mutations/workspace/use-remove-workspace-member";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";

const ROLE_STYLES: Record<string, string> = {
  Owner: "bg-[#8FE3C4]/15 text-[#0F8A65]",
  Admin: "bg-[#3FA9F5]/12 text-[#1B79C4]",
  Member: "bg-[#9AA6A1]/12 text-[#5B6E68]",
  Viewer: "bg-[#9AA6A1]/12 text-[#5B6E68]",
};

export default function Members() {
  const { openMobileNav, currentWorkspaceId } = useDashboardContext();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkRoleId, setLinkRoleId] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: workspace, isLoading } =
    useGetWorkspaceById(currentWorkspaceId);
  const { data: rolesResponse } = useGetWorkspaceRoles(currentWorkspaceId);
  const { data: invitationsResponse, isLoading: isLoadingInvitations } =
    useGetWorkspaceInvitations(currentWorkspaceId);
  const { data: allUsersResponse, isLoading: isLoadingUsers } =
    useGetAllUsers();

  const roles = (rolesResponse as any)?.data ?? [];
  const pendingInvitations = (invitationsResponse as any)?.data ?? [];
  const allUsers = allUsersResponse || [];

  const { mutate: sendInvite, isPending: isInviting } =
    useCreateEmailInvitation();
  const { mutate: generateLink, isPending: isGeneratingLink } =
    useCreateInviteLink();
  const { mutate: updateRole } = useUpdateWorkspaceMemberRole();
  const { mutate: removeMember } = useRemoveWorkspaceMember();
  const { mutate: revokeInvite, isPending: isRevoking } = useRevokeInvitation();

  const workspaceData = (workspace as any)?.data;

  const rawMembers = workspaceData?.members ?? [];

  const ownerAlreadyInList = workspaceData?.owner
    ? rawMembers.some(
        (m: any) =>
          (m.user.id ?? m.user._id) ===
          (workspaceData.owner.id ?? workspaceData.owner._id),
      )
    : true;

  const ownerMember =
    workspaceData?.owner && !ownerAlreadyInList
      ? {
          user: workspaceData.owner,
          role: { id: "owner", name: "Owner" },
          joinedAt: workspaceData.createdAt,
        }
      : null;

  const members = ownerMember ? [ownerMember, ...rawMembers] : rawMembers;

  const existingMemberIds = new Set(
    members.map((m: any) => m.user.id ?? m.user._id),
  );

  const invitableUsers = allUsers.filter(
    (u: any) => !existingMemberIds.has(u.id ?? u._id),
  );

  const resetInviteModal = () => {
    setInviteOpen(false);
    setEmail("");
    setRoleId("");
    setInviteLink(null);
    setLinkRoleId("");
    setCopied(false);
  };

  const handleInvite = () => {
    if (!email.trim() || !roleId) return;

    sendInvite(
      {
        workspaceId: currentWorkspaceId,
        data: { email: email.trim(), roleId },
      },
      {
        onSuccess: () => {
          resetInviteModal();
        },
      },
    );
  };

  const handleGenerateLink = () => {
    if (!linkRoleId) return;

    generateLink(
      {
        workspaceId: currentWorkspaceId,
        data: { roleId: linkRoleId },
      },
      {
        onSuccess: (response: any) => {
          const link =
            response?.data?.link ??
            response?.data?.url ??
            (response?.data?.token
              ? `${window.location.origin}/invite/${response.data.token}`
              : null);
          setInviteLink(link);
          setCopied(false);
        },
      },
    );
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleRoleChange = (userId: string, newRoleId: string) => {
    updateRole({
      workspaceId: currentWorkspaceId,
      userId,
      data: { roleId: newRoleId },
    });
    setOpenMenuUserId(null);
  };

  const handleRemove = (userId: string) => {
    removeMember({ workspaceId: currentWorkspaceId, userId });
    setOpenMenuUserId(null);
  };

  const handleRevoke = (invitationId: string) => {
    revokeInvite({ workspaceId: currentWorkspaceId, invitationId });
  };

  return (
    <>
      <Topbar
        title="Members"
        subtitle={`${members.length} people in this workspace`}
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        <div className="flex items-center justify-end">
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 bg-[#0F2D29] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#0F2D29]/90 transition-colors"
          >
            <UserPlus size={15} />
            Invite member
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#0F8A65]" size={22} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {members.map((m: any) => {
              const userId = m.user.id ?? m.user._id;
              const roleName = m.role?.name ?? "Member";
              const isOwner = roleName === "Owner";

              return (
                <div
                  key={userId}
                  className="bg-white rounded-2xl border border-[#0F2D29]/8 p-5 flex flex-col gap-4 relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-[#0F2D29] bg-[#8FE3C4] shrink-0">
                        {m.user.name
                          .split(" ")
                          .map((p: string) => p[0])
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[#0F2D29] text-[13.5px] font-semibold truncate">
                          {m.user.name}
                        </p>
                        <p className="text-[#5B6E68] text-[12px] truncate flex items-center gap-1">
                          <Mail size={11} className="shrink-0" />
                          {m.user.email}
                        </p>
                      </div>
                    </div>

                    {!isOwner && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuUserId(
                              openMenuUserId === userId ? null : userId,
                            )
                          }
                          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-[#8FA69E] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                          aria-label="More options"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {openMenuUserId === userId && (
                          <div className="absolute right-0 top-8 z-10 w-44 bg-white border border-[#0F2D29]/10 rounded-lg shadow-lg py-1">
                            <p className="px-3 py-1.5 text-[10px] font-bold text-[#8FA69E] uppercase">
                              Change role
                            </p>
                            {roles
                              .filter((r: any) => r.name !== "Owner")
                              .map((r: any) => (
                                <button
                                  key={r.id}
                                  onClick={() => handleRoleChange(userId, r.id)}
                                  className="w-full text-left px-3 py-1.5 text-[12px] text-[#0F2D29] hover:bg-[#0F2D29]/5"
                                >
                                  {r.name}
                                </button>
                              ))}
                            <div className="border-t border-[#0F2D29]/8 mt-1 pt-1">
                              <button
                                onClick={() => handleRemove(userId)}
                                className="w-full text-left px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                              >
                                <Trash2 size={12} />
                                Remove member
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#0F2D29]/6">
                    <span
                      className={`text-[11px] font-medium px-2 py-1 rounded-full ${
                        ROLE_STYLES[roleName] ||
                        "bg-[#9AA6A1]/12 text-[#5B6E68]"
                      }`}
                    >
                      {roleName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoadingInvitations && pendingInvitations.length > 0 && (
          <div className="mt-2">
            <h3 className="text-[12px] font-bold text-[#5B6E68] uppercase mb-3">
              Pending invitations
            </h3>
            <div className="flex flex-col gap-2">
              {pendingInvitations.map((inv: any) => {
                const invId = inv.id ?? inv._id;
                return (
                  <div
                    key={invId}
                    className="bg-white rounded-xl border border-[#0F2D29]/8 px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock size={14} className="text-[#8FA69E] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[#0F2D29] text-[13px] font-medium truncate">
                          {inv.email}
                        </p>
                        <p className="text-[#8FA69E] text-[11px]">
                          Invited as {inv.role?.name ?? "Member"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevoke(invId)}
                      disabled={isRevoking}
                      className="text-[11px] font-medium text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm border border-[#0F2D29]/15 bg-white rounded-2xl p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-black text-[#0F2D29]">
                Invite member
              </h2>
              <button onClick={resetInviteModal}>
                <X size={16} className="text-[#0F2D29]/60" />
              </button>
            </div>

            <label className="mb-1 block text-[11px] font-bold text-[#0F2D29]/70">
              User
            </label>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoadingUsers}
              className="mb-3 w-full border border-[#0F2D29]/20 rounded-lg px-3 py-2 text-xs outline-none disabled:opacity-50"
            >
              <option value="">
                {isLoadingUsers ? "Loading users..." : "Select a user"}
              </option>
              {invitableUsers.map((u: any) => (
                <option key={u.id ?? u._id} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <label className="mb-1 block text-[11px] font-bold text-[#0F2D29]/70">
              Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="mb-4 w-full border border-[#0F2D29]/20 rounded-lg px-3 py-2 text-xs outline-none"
            >
              <option value="">Select role</option>
              {roles
                .filter((r: any) => r.name !== "Owner")
                .map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={resetInviteModal}
                className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!email.trim() || !roleId || isInviting}
                className="bg-[#0F2D29] px-3.5 py-2 rounded-lg text-xs font-bold text-white disabled:opacity-50"
              >
                {isInviting ? "Inviting..." : "Send invite"}
              </button>
            </div>

            <div className="flex items-center gap-2 my-4">
              <div className="h-px flex-1 bg-[#0F2D29]/10" />
              <span className="text-[10px] font-bold text-[#8FA69E] uppercase">
                Or
              </span>
              <div className="h-px flex-1 bg-[#0F2D29]/10" />
            </div>

            <label className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[#0F2D29]/70">
              <LinkIcon size={12} />
              Invite via link
            </label>
            <select
              value={linkRoleId}
              onChange={(e) => setLinkRoleId(e.target.value)}
              className="mb-3 w-full border border-[#0F2D29]/20 rounded-lg px-3 py-2 text-xs outline-none"
            >
              <option value="">Select role for link</option>
              {roles
                .filter((r: any) => r.name !== "Owner")
                .map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>

            {!inviteLink ? (
              <button
                onClick={handleGenerateLink}
                disabled={!linkRoleId || isGeneratingLink}
                className="w-full flex items-center justify-center gap-1.5 border border-[#0F2D29]/20 text-[#0F2D29] text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-[#0F2D29]/5 disabled:opacity-50"
              >
                {isGeneratingLink ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <LinkIcon size={13} />
                    Generate invite link
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 min-w-0 border border-[#0F2D29]/20 rounded-lg px-3 py-2 text-[11px] text-[#0F2D29]/80 outline-none bg-[#0F2D29]/3"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-[#0F2D29]/20 text-[#0F2D29] hover:bg-[#0F2D29]/5"
                  aria-label="Copy invite link"
                >
                  {copied ? (
                    <Check size={14} className="text-[#0F8A65]" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
