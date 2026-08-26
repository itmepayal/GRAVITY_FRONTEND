import { useMemo } from "react";
import {
  Mail,
  MoreHorizontal,
  UserPlus,
  Loader2,
  Trash2,
  Clock,
  Link as LinkIcon,
  Users,
  Shield,
  UserCheck,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { WorkspaceShareSettings } from "@/components/workspace/WorkspaceShareSettings";
import { WorkspaceInviteModal } from "@/components/workspace/WorkspaceInviteModal";
import { useMembersPage } from "@/hooks/members/use-members-page";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import {
  DashboardMetricsBanner,
  type MetricCardData,
} from "@/components/common/DashboardMetricsBanner";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";
import { SHARE_MODE_META, type WorkspaceShareMode } from "@/types/sharing";

const ROLE_STYLES: Record<string, string> = {
  Owner: "bg-[#8FE3C4]/20 text-[#0F8A65] border-[#8FE3C4]/40",
  Admin: "bg-[#3FA9F5]/12 text-[#1B79C4] border-[#3FA9F5]/25",
  Member: "bg-[#9AA6A1]/12 text-[#5B6E68] border-[#9AA6A1]/25",
  Viewer: "bg-[#9AA6A1]/12 text-[#5B6E68] border-[#9AA6A1]/25",
  Commenter: "bg-[#9AA6A1]/12 text-[#5B6E68] border-[#9AA6A1]/25",
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatJoinedDate(value?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function Members() {
  const { openMobileNav, currentWorkspaceId } = useDashboardContext();
  const { workspaces } = useSyncedWorkspace();

  const {
    workspaceData,
    sharing,
    shareMode,
    canUseLinkInvites,
    members,
    roles,
    invitableUsers,
    emailInvitations,
    linkInvitations,
    isLoading,
    isLoadingInvitations,
    isLoadingUsers,
    isInviting,
    isGeneratingLink,
    isRevoking,
    inviteOpen,
    setInviteOpen,
    email,
    setEmail,
    roleId,
    setRoleId,
    openMenuUserId,
    setOpenMenuUserId,
    inviteLink,
    linkRoleId,
    setLinkRoleId,
    copied,
    resetInviteModal,
    handleInvite,
    handleGenerateLink,
    handleCopyLink,
    handleRoleChange,
    handleRemove,
    handleRevoke,
    getRoleId,
    getEntityId,
  } = useMembersPage(currentWorkspaceId);

  const workspaceName = useMemo(() => {
    const fromDetail = workspaceData?.name as string | undefined;
    if (fromDetail) return fromDetail;

    const matched = workspaces.find(
      (ws) => (ws.id ?? ws._id) === currentWorkspaceId,
    );
    return matched?.name ?? "Workspace";
  }, [workspaceData, workspaces, currentWorkspaceId]);

  const shareMeta =
    SHARE_MODE_META[(shareMode as WorkspaceShareMode) ?? "private"];

  const metricCards: MetricCardData[] = [
    {
      title: "Total Members",
      value: members.length,
      subtitle: "People in this workspace",
      icon: Users,
      accentColor: "#0F8A65",
      bgGradient: "from-[#8FE3C4]/15 to-transparent",
    },
    {
      title: "Pending Invites",
      value: sharing?.pendingEmailInviteCount ?? emailInvitations.length,
      subtitle: "Awaiting acceptance",
      icon: Clock,
      accentColor: "#1B79C4",
      bgGradient: "from-[#3FA9F5]/10 to-transparent",
    },
    {
      title: "Access Mode",
      value: shareMeta.label,
      subtitle: shareMeta.description,
      icon: Shield,
      accentColor: "#0F2D29",
      bgGradient: "from-[#0F2D29]/8 to-transparent",
    },
    {
      title: "Active Links",
      value: sharing?.activeLinkCount ?? linkInvitations.length,
      subtitle: canUseLinkInvites ? "Shareable join links" : "Link sharing off",
      icon: LinkIcon,
      accentColor: "#0F8A65",
      bgGradient: "from-[#8FE3C4]/10 to-transparent",
    },
  ];

  return (
    <>
      <Topbar
        title="Members"
        subtitle={`${workspaceName} · manage team access and invitations`}
        onMenuClick={openMobileNav}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <DashboardMetricsBanner cards={metricCards} />

        <section className="rounded-2xl border border-[#0F2D29]/10 bg-white p-4 sm:p-5">
          <WorkspaceShareSettings
            workspaceId={currentWorkspaceId}
            workspaceName={workspaceName}
            roles={roles}
            hideInviteSection
            compact
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white shadow-xs">
          <div className="flex flex-col gap-3 border-b border-[#0F2D29]/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2
                className={`text-[15px] font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}
              >
                Workspace Members
              </h2>
              <p className={`mt-0.5 text-[12px] text-[#5B6E68] ${FONT_POPPINS}`}>
                {members.length} member{members.length === 1 ? "" : "s"} with
                role-based access
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F2D29] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0F2D29]/90"
            >
              <UserPlus size={15} />
              Invite member
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#0F8A65]" size={24} />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8FE3C4]/20 text-[#0F8A65]">
                <UserCheck size={22} />
              </div>
              <p className={`text-[14px] font-semibold text-[#0F2D29] ${FONT_GOLDMAN}`}>
                No members yet
              </p>
              <p className={`max-w-sm text-[12px] text-[#5B6E68] ${FONT_POPPINS}`}>
                Invite teammates by email to start collaborating in this
                workspace.
              </p>
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#0F8A65] px-4 py-2 text-[12px] font-medium text-white"
              >
                <UserPlus size={14} />
                Invite first member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full min-w-[640px] text-left ${FONT_POPPINS}`}>
                <thead
                  className={`border-b border-[#0F2D29]/8 bg-[#F8F7F3] text-[11px] font-bold uppercase tracking-wider text-[#5B6E68] ${FONT_GOLDMAN}`}
                >
                  <tr>
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F2D29]/6">
                  {members.map((m: any) => {
                    const userId = getEntityId(m.user);
                    const roleName = m.role?.name ?? "Member";
                    const isOwner = roleName === "Owner";

                    return (
                      <tr
                        key={userId}
                        className="transition-colors hover:bg-[#0F2D29]/[0.02]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8FE3C4] text-[12px] font-bold text-[#0F2D29]">
                              {getInitials(m.user.name ?? "U")}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-[#0F2D29]">
                                {m.user.name}
                              </p>
                              <p className="truncate text-[11px] text-[#5B6E68] flex items-center gap-1">
                                <Mail size={11} className="shrink-0" />
                                {m.user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              ROLE_STYLES[roleName] ??
                              "bg-[#9AA6A1]/12 text-[#5B6E68] border-[#9AA6A1]/25"
                            }`}
                          >
                            {roleName}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[#5B6E68]">
                          {formatJoinedDate(m.joinedAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {!isOwner ? (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuUserId(
                                    openMenuUserId === userId ? null : userId,
                                  )
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#8FA69E] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                                aria-label="Member actions"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {openMenuUserId === userId && (
                                <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-[#0F2D29]/10 bg-white py-1 shadow-lg">
                                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#8FA69E]">
                                    Change role
                                  </p>
                                  {roles.map((r: any) => (
                                    <button
                                      key={getRoleId(r)}
                                      type="button"
                                      onClick={() =>
                                        handleRoleChange(userId, getRoleId(r))
                                      }
                                      className="w-full px-3 py-1.5 text-left text-[12px] text-[#0F2D29] hover:bg-[#0F2D29]/5"
                                    >
                                      {r.name}
                                    </button>
                                  ))}
                                  <div className="mt-1 border-t border-[#0F2D29]/8 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleRemove(userId)}
                                      className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-[12px] text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 size={12} />
                                      Remove member
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#8FA69E]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {!isLoadingInvitations &&
          (emailInvitations.length > 0 || linkInvitations.length > 0) && (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {emailInvitations.length > 0 && (
                <div className="rounded-2xl border border-[#0F2D29]/10 bg-white p-4 sm:p-5">
                  <h3
                    className={`mb-3 text-[12px] font-bold uppercase tracking-wide text-[#5B6E68] ${FONT_GOLDMAN}`}
                  >
                    Pending email invitations
                  </h3>
                  <div className="space-y-2">
                    {emailInvitations.map((inv: any) => {
                      const invId = getEntityId(inv);
                      return (
                        <div
                          key={invId}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#0F2D29]/8 px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Clock
                              size={14}
                              className="shrink-0 text-[#8FA69E]"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-medium text-[#0F2D29]">
                                {inv.email}
                              </p>
                              <p className="text-[11px] text-[#8FA69E]">
                                As {inv.role?.name ?? "Member"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevoke(invId)}
                            disabled={isRevoking}
                            className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {linkInvitations.length > 0 && (
                <div className="rounded-2xl border border-[#0F2D29]/10 bg-white p-4 sm:p-5">
                  <h3
                    className={`mb-3 text-[12px] font-bold uppercase tracking-wide text-[#5B6E68] ${FONT_GOLDMAN}`}
                  >
                    Active share links
                  </h3>
                  <div className="space-y-2">
                    {linkInvitations.map((inv: any) => {
                      const invId = getEntityId(inv);
                      return (
                        <div
                          key={invId}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#0F2D29]/8 px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <LinkIcon
                              size={14}
                              className="shrink-0 text-[#8FA69E]"
                            />
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-[#0F2D29]">
                                Shareable link
                              </p>
                              <p className="text-[11px] text-[#8FA69E]">
                                {inv.linkPermission ?? inv.role?.name ?? "View"}{" "}
                                · {inv.joinCount ?? 0} uses
                                {inv.maxUses ? ` / ${inv.maxUses}` : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevoke(invId)}
                            disabled={isRevoking}
                            className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}
      </main>

      {inviteOpen && (
        <WorkspaceInviteModal
          workspaceName={workspaceName}
          inviteEmail={email}
          onInviteEmailChange={setEmail}
          inviteRoleId={roleId}
          onInviteRoleIdChange={setRoleId}
          linkRoleId={linkRoleId}
          onLinkRoleIdChange={setLinkRoleId}
          inviteLink={inviteLink}
          copied={copied}
          roles={roles.map((r: any) => ({
            id: getRoleId(r),
            name: r.name,
          }))}
          invitableUsers={invitableUsers}
          isLoadingUsers={isLoadingUsers}
          isInviting={isInviting}
          isGeneratingLink={isGeneratingLink}
          onClose={resetInviteModal}
          onInvite={handleInvite}
          onGenerateLink={canUseLinkInvites ? handleGenerateLink : () => {}}
          onCopyLink={handleCopyLink}
        />
      )}
    </>
  );
}
