import { useMemo, useState } from "react";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import {
  useGetWorkspaceMembers,
  useGetWorkspaceRoles,
  useGetWorkspaceInvitations,
  useGetWorkspaceSharing,
} from "@/hooks/queries/members";
import {
  useCreateEmailInvitation,
  useCreateInviteLink,
  useRemoveWorkspaceMember,
  useRevokeInvitation,
  useUpdateWorkspaceMemberRole,
} from "@/hooks/mutations/members";
import type { LinkPermission } from "@/types/sharing";

import type { Workspace } from "@/types/workspace";

export const getEntityId = (entity?: {
  id?: string;
  _id?: string;
} | null): string => entity?.id ?? entity?._id ?? "";

export const getRoleId = (role?: {
  id?: string;
  _id?: string;
} | null): string => role?.id ?? role?._id ?? "";

export function useMembersPage(workspaceId: string) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkRoleId, setLinkRoleId] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: workspaceResponse, isLoading } =
    useGetWorkspaceMembers(workspaceId);
  const { data: rolesResponse } = useGetWorkspaceRoles(workspaceId);
  const { data: invitationsResponse, isLoading: isLoadingInvitations } =
    useGetWorkspaceInvitations(workspaceId);
  const { data: sharingResponse } = useGetWorkspaceSharing(workspaceId);
  const { data: allUsersResponse, isLoading: isLoadingUsers } =
    useGetAllUsers();

  const { mutate: sendInvite, isPending: isInviting } =
    useCreateEmailInvitation();
  const { mutate: generateLink, isPending: isGeneratingLink } =
    useCreateInviteLink();
  const { mutate: updateRole } = useUpdateWorkspaceMemberRole();
  const { mutate: removeMember } = useRemoveWorkspaceMember();
  const { mutate: revokeInvite, isPending: isRevoking } = useRevokeInvitation();

  const workspaceData = useMemo(() => {
    const res = workspaceResponse as { data?: Workspace } | Workspace | undefined;
    if (!res) return undefined;
    return ("data" in res && res.data ? res.data : res) as Workspace;
  }, [workspaceResponse]);
  const roles = (rolesResponse as any)?.data ?? [];
  const allInvitations = (invitationsResponse as any)?.data ?? [];
  const sharing = sharingResponse?.data;
  const allUsers = allUsersResponse || [];

  const shareMode = sharing?.shareMode ?? workspaceData?.shareMode ?? "private";
  const canUseLinkInvites = shareMode === "link";

  const emailInvitations = useMemo(
    () => allInvitations.filter((inv: any) => inv.type === "email"),
    [allInvitations],
  );

  const linkInvitations = useMemo(
    () => allInvitations.filter((inv: any) => inv.type === "link"),
    [allInvitations],
  );

  const members = useMemo(() => {
    const rawMembers = workspaceData?.members ?? [];

    const ownerAlreadyInList = workspaceData?.owner
      ? rawMembers.some(
          (m: any) =>
            getEntityId(m.user) === getEntityId(workspaceData.owner),
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

    return ownerMember ? [ownerMember, ...rawMembers] : rawMembers;
  }, [workspaceData]);

  const existingMemberIds = useMemo(
    () => new Set(members.map((m: any) => getEntityId(m.user))),
    [members],
  );

  const invitableRoles = useMemo(
    () => roles.filter((r: any) => r.name?.toLowerCase() !== "owner"),
    [roles],
  );

  const invitableUsers = useMemo(
    () =>
      allUsers.filter((u: any) => !existingMemberIds.has(getEntityId(u))),
    [allUsers, existingMemberIds],
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
    if (!email.trim() || !roleId || !workspaceId) return;

    sendInvite(
      {
        workspaceId,
        data: { email: email.trim(), roleId },
      },
      { onSuccess: () => resetInviteModal() },
    );
  };

  const handleGenerateLink = () => {
    if (!workspaceId) return;
    if (!canUseLinkInvites) return;

    const linkPermission =
      (sharing?.sharingSettings?.linkPermission as LinkPermission) ?? "view";

    generateLink(
      {
        workspaceId,
        data: {
          ...(linkRoleId ? { roleId: linkRoleId } : { linkPermission }),
          expiryPreset: sharing?.sharingSettings?.linkExpiryPreset ?? "7d",
        },
      },
      {
        onSuccess: (response: any) => {
          const payload = response?.data ?? response;
          const link =
            payload?.inviteLink ??
            payload?.link ??
            payload?.url ??
            (payload?.token
              ? `${window.location.origin}/invite/${payload.token}`
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
    } catch {
      // ignore
    }
  };

  const handleRoleChange = (userId: string, newRoleId: string) => {
    updateRole({
      workspaceId,
      userId,
      data: { roleId: newRoleId },
    });
    setOpenMenuUserId(null);
  };

  const handleRemove = (userId: string) => {
    removeMember({ workspaceId, userId });
    setOpenMenuUserId(null);
  };

  const handleRevoke = (invitationId: string) => {
    revokeInvite({ workspaceId, invitationId });
  };

  return {
    workspaceData,
    sharing,
    shareMode,
    canUseLinkInvites,
    members,
    roles: invitableRoles,
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
  };
}
