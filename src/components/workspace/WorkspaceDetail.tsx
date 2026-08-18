import { useState } from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Lock,
  Globe,
  FolderKanban,
  Users,
  Shield,
  Activity,
  Loader2,
  UserPlus,
} from "lucide-react";
import {
  type Workspace,
  type Tab,
  type Project,
  type ActivityItem,
  type Role,
  ROLE_META,
  initials,
  formatDate,
} from "./types";
import { AvatarStack } from "./WorkspaceListItem";
import { ProjectsPanel } from "./ProjectsPanel";
import { MembersPanel } from "./MembersPanel";
import { RolesPanel } from "./RolesPanel";
import { ActivityPanel } from "./ActivityPanel";
import { EditWorkspaceModal } from "./EditWorkspaceModal";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { DeleteWorkspaceModal } from "./DeleteWorkspaceModal";

interface WorkspaceDetailProps {
  workspace: Workspace;
  isRefreshing?: boolean;
  isDeleting?: boolean;
  isRemovingMember?: boolean;
  onUpdated: (patch: Partial<Workspace>) => void;
  onDeleted: () => void;
  onRemoveMember: (memberId: string, memberLabel: string) => void;
  onUpdateMemberRole: (
    memberId: string,
    newRole: string,
    memberLabel: string,
  ) => void;
  isUpdatingMemberRole?: boolean;
  addActivity: (
    action: string,
    target: string,
    iconType: ActivityItem["iconType"],
  ) => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
  onOpenAddProject?: () => void;
  onOpenInviteTeammate?: () => void;
}

export const WorkspaceDetail = ({
  workspace,
  isRefreshing = false,
  isDeleting = false,
  isRemovingMember = false,
  onUpdated,
  onDeleted,
  onRemoveMember,
  onUpdateMemberRole,
  isUpdatingMemberRole = false,
  addActivity,
  addToast,
  onOpenAddProject,
  onOpenInviteTeammate,
}: WorkspaceDetailProps) => {
  const [tab, setTab] = useState<Tab>("projects");
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const normalizedRole = (workspace.role || "member").toLowerCase() as Role;
  const roleMeta = ROLE_META[normalizedRole];

  const canManage = normalizedRole === "owner" || normalizedRole === "admin";
  const isOwner = normalizedRole === "owner";
  const RoleIcon = roleMeta?.icon ?? Users;

  const handleSaveWorkspaceEdit = (patch: Partial<Workspace>) => {
    onUpdated(patch);
    setEditing(false);
    addActivity(
      "updated workspace settings",
      patch.name || workspace.name,
      "workspace",
    );
    addToast("success", "Workspace settings updated.");
  };

  const deleteWorkspace = () => setConfirmingDelete(true);

  const confirmDelete = () => {
    onDeleted();
  };

  const stats = [
    {
      label: "Projects",
      value: workspace.projects.length,
      icon: FolderKanban,
      tint: "bg-[#8FE3C4]/20 text-[#0F8A65]",
    },
    {
      label: "Teammates",
      value: workspace.members.length,
      icon: Users,
      tint: "bg-[#3FA9F5]/15 text-[#1B79C4]",
    },
    {
      label: "Custom Roles",
      value: workspace.roles.length,
      icon: Shield,
      tint: "bg-[#C4B5FD]/20 text-[#7C3AED]",
    },
  ];

  const tabs: {
    id: Tab;
    label: string;
    icon: typeof FolderKanban;
    count?: number;
  }[] = [
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban,
      count: workspace.projects.length,
    },
    {
      id: "members",
      label: "Members",
      icon: Users,
      count: workspace.members.length,
    },
    {
      id: "roles",
      label: "Roles & Permissions",
      icon: Shield,
      count: workspace.roles.length,
    },
    {
      id: "activity",
      label: "Activity Log",
      icon: Activity,
      count: workspace.activityLog?.length || 0,
    },
  ];

  return (
    <div className="overflow-hidden border border-[#0F2D29]/12 bg-white shadow-2xs transition-shadow">
      <div className="relative overflow-hidden border-b border-[#0F2D29]/10 bg-white">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background: `linear-gradient(135deg, ${workspace.color || "#6366F1"} 0%, #0F2D29 100%)`,
          }}
        />
        <div className="absolute -top-16 -right-16 h-56 w-56 bg-[#8FE3C4]/15 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-40 w-40 bg-[#3FA9F5]/10 blur-3xl" />

        {(isRefreshing || isDeleting) && (
          <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-[#0F2D29]/5">
            <div
              className={`h-full w-1/3 animate-[loading-bar_1.1s_ease-in-out_infinite] ${
                isDeleting ? "bg-red-500" : "bg-[#0F8A65]"
              }`}
            />
          </div>
        )}

        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center text-[24px] font-extrabold text-[#0F2D29] shadow-sm border border-[#0F2D29]/20"
                style={{ backgroundColor: workspace.color || "#6366F1" }}
              >
                {workspace.icon || initials(workspace.name)}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  className="max-w-full truncate text-[22px] font-bold tracking-tight text-[#0F2D29] font-['Goldman',sans-serif] sm:text-[24px]"
                  title={workspace.name}
                >
                  {workspace.name}
                </h2>

                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {isRefreshing && !isDeleting && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-[#0F2D29]/5 px-2 py-0.5 text-[11px] font-medium text-[#5B6E68]"
                      title="Refreshing workspace..."
                    >
                      <Loader2 size={11} className="animate-spin" />
                      Syncing
                    </span>
                  )}

                  {isDeleting && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600"
                      title="Deleting workspace..."
                    >
                      <Loader2 size={11} className="animate-spin" />
                      Deleting
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ring-black/5 ${
                      roleMeta?.badge ?? "bg-[#0F2D29]/5 text-[#5B6E68]"
                    }`}
                  >
                    <RoleIcon size={11} />
                    {roleMeta?.label ?? workspace.role}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      workspace.isPrivate
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {workspace.isPrivate ? (
                      <Lock size={11} />
                    ) : (
                      <Globe size={11} />
                    )}
                    {workspace.isPrivate ? "Private" : "Public"}
                  </span>
                </div>

                {workspace.description ? (
                  <p
                    className="mt-2 line-clamp-2 max-w-2xl wrap-break-word text-[13.5px] leading-relaxed text-[#5B6E68]"
                    title={workspace.description}
                  >
                    {workspace.description}
                  </p>
                ) : (
                  <p className="mt-2 text-[12.5px] italic text-[#8FA69E]">
                    No description provided for this workspace.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F2D29]/5 px-2.5 py-1 text-[11.5px] font-medium text-[#5B6E68]">
                    <Calendar size={12} className="text-[#8FA69E]" />
                    Created {formatDate(workspace.createdAt)}
                  </span>
                  <AvatarStack
                    members={workspace.members.slice(0, 4)}
                    extra={Math.max(0, workspace.members.length - 4)}
                  />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start">
              {canManage && onOpenInviteTeammate && (
                <button
                  onClick={onOpenInviteTeammate}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#0F2D29]/15 bg-white px-3.5 py-2 text-[12.5px] font-medium text-[#0F2D29] shadow-xs transition-colors duration-150 hover:bg-[#0F2D29]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2D29]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus size={13} />
                  Invite
                </button>
              )}

              {canManage && (
                <button
                  onClick={() => setEditing(true)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#0F2D29]/15 bg-white px-3.5 py-2 text-[12.5px] font-medium text-[#0F2D29] shadow-xs transition-colors duration-150 hover:bg-[#0F2D29]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F2D29]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil size={13} />
                  Edit Settings
                </button>
              )}

              {isOwner && (
                <button
                  onClick={deleteWorkspace}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2 text-[12.5px] font-medium text-red-600 transition-colors duration-150 hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3.5 sm:gap-4">
            {stats.map(({ label, value, icon: Icon, tint }) => (
              <div
                key={label}
                className="group rounded-xl border border-[#0F2D29]/8 bg-white/80 p-3.5 shadow-2xs backdrop-blur-md transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0F2D29]/15 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#8FA69E]">
                    {label}
                  </span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform duration-150 group-hover:scale-105 ${tint}`}
                  >
                    <Icon size={14} />
                  </div>
                </div>
                <p className="mt-1 text-[20px] font-extrabold tracking-tight text-[#0F2D29] tabular-nums">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-b border-[#0F2D29]/10 bg-[#0F2D29]/4 px-6">
        <div className="flex gap-1 overflow-x-auto py-2.5">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] transition-all duration-150 ${
                tab === id
                  ? "bg-[#0F2D29] text-white shadow-2xs"
                  : "text-[#5B6E68] hover:bg-[#0F2D29]/10 hover:text-[#0F2D29]"
              }`}
            >
              <Icon size={15} />
              <span>{label}</span>
              {typeof count === "number" && (
                <span
                  className={`min-w-4.5 px-1.5 py-0.5 text-center text-[10.5px] font-bold tabular-nums ${
                    tab === id
                      ? "bg-white/20 text-white"
                      : "bg-[#0F2D29]/10 text-[#0F2D29]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-7">
        {tab === "projects" && (
          <ProjectsPanel
            workspaceId={workspace._id}
            canManage={canManage}
            onChange={(projects) => onUpdated({ projects })}
            addActivity={addActivity}
            addToast={addToast}
            onOpenAddProject={onOpenAddProject}
          />
        )}

        {tab === "members" && (
          <>
            {canManage && onOpenInviteTeammate && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-dashed border-[#0F2D29]/15 bg-[#0F2D29]/3 px-4 py-3">
                <p className="text-[12.5px] text-[#5B6E68]">
                  Send an email invite or share an invite link to bring someone
                  into this workspace.
                </p>
                <button
                  onClick={onOpenInviteTeammate}
                  className="inline-flex shrink-0 items-center gap-1.5 bg-[#0F2D29] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#0F2D29]/90"
                >
                  <UserPlus size={13} />
                  Invite teammate
                </button>
              </div>
            )}

            <MembersPanel
              members={workspace.members}
              canManage={canManage}
              onChange={(members) => onUpdated({ members })}
              onRemoveMember={onRemoveMember}
              isRemovingMember={isRemovingMember}
              onUpdateMemberRole={onUpdateMemberRole}
              isUpdatingMemberRole={isUpdatingMemberRole}
            />
          </>
        )}

        {tab === "roles" && (
          <RolesPanel
            workspaceId={workspace._id}
            canManage={canManage}
            addActivity={addActivity}
            addToast={addToast}
          />
        )}

        {tab === "activity" && (
          <ActivityPanel activityLog={workspace.activityLog || []} />
        )}
      </div>

      {editing && (
        <EditWorkspaceModal
          workspace={workspace}
          onClose={() => setEditing(false)}
          onSave={handleSaveWorkspaceEdit}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          workspaceId={workspace._id}
          canManage={canManage}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {confirmingDelete && (
        <DeleteWorkspaceModal
          workspace={workspace}
          isDeleting={isDeleting}
          onClose={() => setConfirmingDelete(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};
