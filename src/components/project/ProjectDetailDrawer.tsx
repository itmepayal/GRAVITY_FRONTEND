import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, Pencil, Trash2, Layers, KanbanSquare, Loader2 } from "lucide-react";
import {
  type Project,
  type ProjectStatus,
  STATUS_META,
  initials,
} from "./types";
import { useUpdateProjectMemberRole } from "@/hooks/mutations/project/use-update-project-member-role";
import { useRemoveProjectMember } from "@/hooks/mutations/project/use-remove-project-member";

export interface AvailableUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface WorkspaceRoleOption {
  id: string;
  name: string;
}

export interface ProjectDetailDrawerProps {
  project: Project;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
  onCreateBoard: () => void;

  canManage?: boolean;
  currentUserId?: string;
  availableUsers?: AvailableUser[];
  workspaceRoles?: WorkspaceRoleOption[];
}

const getRoleName = (role: unknown): string => {
  if (!role) return "Member";
  if (typeof role === "string") return role;
  if (typeof role === "object" && "name" in (role as any)) {
    return (role as any).name ?? "Member";
  }
  return "Member";
};

const getRoleId = (role: unknown): string | null => {
  if (!role) return null;
  if (typeof role === "string") return null;
  if (typeof role === "object" && "_id" in (role as any)) {
    return (role as any)._id ?? null;
  }
  if (typeof role === "object" && "id" in (role as any)) {
    return (role as any).id ?? null;
  }
  return null;
};

export const ProjectDetailDrawer: React.FC<ProjectDetailDrawerProps> = ({
  project,
  onClose,
  onEdit,
  onDelete,
  onUpdateStatus,
  onCreateBoard,
  canManage = false,
  currentUserId,
  workspaceRoles = [],
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "members">(
    "overview",
  );
  const [pendingRemoveUserId, setPendingRemoveUserId] = useState<string | null>(
    null,
  );

  const meta = STATUS_META[project.status] || STATUS_META.planning;
  const navigate = useNavigate();

  const { mutate: updateMemberRole, isPending: isUpdatingRole } =
    useUpdateProjectMemberRole();
  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveProjectMember();

  const handleCreateBoard = () => {
    onCreateBoard();
    navigate("/dashboard/boards");
  };

  const assignableRoles = useMemo(
    () => workspaceRoles.filter((r) => r.name.toLowerCase() !== "owner"),
    [workspaceRoles],
  );

  const handleRoleChange = (userId: string, newRoleId: string) => {
    if (!newRoleId) return;

    updateMemberRole({
      projectId: project.id,
      userId,
      data: { roleId: newRoleId },
    });
  };

  const handleConfirmRemove = () => {
    if (!pendingRemoveUserId) return;

    removeMember(
      { projectId: project.id, userId: pendingRemoveUserId },
      {
        onSuccess: () => setPendingRemoveUserId(null),
      },
    );
  };

  const removingMember = project.members.find(
    (m) => m.user.id === pendingRemoveUserId,
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0F2D29]/50 backdrop-blur-md transition-all">
      <div className="fixed inset-0" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-[#0F2D29] bg-white shadow-2xl z-10">
        <div className="flex items-start justify-between bg-[#0F2D29] p-6 text-white sm:p-7">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center font-bold text-white shadow-2xs font-['Goldman',sans-serif] text-[15px]"
              style={{ backgroundColor: project.color || "#0F2D29" }}
            >
              {initials(project.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-[18px] font-bold font-['Goldman',sans-serif] text-white truncate">
                {project.name}
              </h2>
              <p className="text-[12px] font-semibold text-[#B7CFC7]">
                {project.workspaceName || "Workspace Project"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#B7CFC7] hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-[#0F2D29]/10 bg-[#0F2D29]/4 px-6 py-3">
          <div className="flex items-center gap-2">
            <select
              value={project.status}
              onChange={(e) =>
                onUpdateStatus(project.id, e.target.value as ProjectStatus)
              }
              className="border border-[#0F2D29]/20 bg-white px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] outline-none cursor-pointer uppercase"
            >
              {(Object.keys(STATUS_META) as ProjectStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateBoard}
              className="flex items-center gap-1.5 border border-[#0F8A65]/30 bg-[#E7F5EF] px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F8A65] hover:bg-[#0F8A65] hover:text-white transition"
            >
              <KanbanSquare size={13} />
              New Board
            </button>
            <button
              onClick={() => onEdit(project)}
              className="flex items-center gap-1.5 border border-[#0F2D29]/20 bg-white px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] hover:bg-[#0F2D29] hover:text-white transition"
            >
              <Pencil size={13} />
              Edit
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="flex items-center gap-1.5 border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-bold font-['Goldman',sans-serif] text-red-600 hover:bg-red-600 hover:text-white transition"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>

        <div className="flex border-b border-[#0F2D29]/10 bg-white px-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`border-b-2 py-3 px-4 text-[13px] font-bold font-['Goldman',sans-serif] transition ${
              activeTab === "overview"
                ? "border-[#0F2D29] text-[#0F2D29]"
                : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`border-b-2 py-3 px-4 text-[13px] font-bold font-['Goldman',sans-serif] transition ${
              activeTab === "members"
                ? "border-[#0F2D29] text-[#0F2D29]"
                : "border-transparent text-[#5B6E68] hover:text-[#0F2D29]"
            }`}
          >
            Teammates ({project.members.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" ? (
            <>
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-[13px] font-medium leading-relaxed text-[#5B6E68] bg-[#0F2D29]/3 border border-[#0F2D29]/10 p-4">
                  {project.description ||
                    "No description provided for this project."}
                </p>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px] font-bold font-['Goldman',sans-serif]">
                  <span className="text-[#0F2D29] uppercase">
                    Delivery Completion
                  </span>
                  <span className="text-[#0F2D29]">{project.progress}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden bg-[#0F2D29]/10 border border-[#0F2D29]/15">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#0F2D29]/15 p-4 bg-white">
                  <p className="text-[11px] font-bold font-['Goldman',sans-serif] text-[#5B6E68] uppercase">
                    Total Tasks
                  </p>
                  <p className="mt-1 text-[20px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] flex items-center gap-2">
                    <Layers size={18} />
                    {project.tasksCount}
                  </p>
                </div>
                <div className="border border-[#0F2D29]/15 p-4 bg-white">
                  <p className="text-[11px] font-bold font-['Goldman',sans-serif] text-[#5B6E68] uppercase">
                    Owner
                  </p>
                  <p className="mt-1 text-[13.5px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] truncate">
                    {project.owner.name || "Project Lead"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[12px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] uppercase tracking-wider">
                  Assigned Team
                </h4>
              </div>

              {removingMember && (
                <div className="border border-red-200 bg-red-50 p-4 space-y-2">
                  <p className="text-[12.5px] font-medium text-[#0F2D29]">
                    Remove{" "}
                    <span className="font-bold">
                      {removingMember.user.name}
                    </span>{" "}
                    from this project?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setPendingRemoveUserId(null)}
                      disabled={isRemoving}
                      className="px-3 py-1.5 text-[12px] font-medium text-[#5B6E68] disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmRemove}
                      disabled={isRemoving}
                      className="inline-flex items-center gap-1.5 bg-red-600 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-red-700 transition disabled:opacity-40"
                    >
                      {isRemoving && (
                        <Loader2 size={13} className="animate-spin" />
                      )}
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-[#0F2D29]/10 border border-[#0F2D29]/15 bg-white">
                {project.members.map((m) => {
                  const roleName = getRoleName(m.role);
                  const roleId = getRoleId(m.role);
                  const isOwner = roleName.toLowerCase() === "owner";
                  const isSelf = currentUserId === m.user.id;

                  return (
                    <div
                      key={m.user.id}
                      className="flex items-center justify-between p-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-[#8FE3C4] text-[#0F2D29] flex items-center justify-center font-bold text-[10px] font-['Goldman',sans-serif]">
                          {initials(m.user.name || "U")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] truncate">
                            {m.user.name}
                          </p>
                          <p className="text-[11px] text-[#5B6E68] truncate">
                            {m.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {canManage && !isOwner ? (
                          <select
                            value={roleId ?? ""}
                            disabled={isUpdatingRole}
                            onChange={(e) =>
                              handleRoleChange(m.user.id, e.target.value)
                            }
                            className="border border-[#0F2D29]/15 bg-white px-2 py-1 text-[11px] font-bold text-[#0F2D29] outline-none"
                          >
                            {!roleId && (
                              <option value="" disabled>
                                {roleName}
                              </option>
                            )}
                            {assignableRoles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="border border-[#0F2D29]/15 bg-[#0F2D29]/5 px-2.5 py-0.5 text-[10.5px] font-bold uppercase text-[#0F2D29] font-['Goldman',sans-serif]">
                            {roleName}
                          </span>
                        )}

                        {canManage && !isOwner && !isSelf && (
                          <button
                            onClick={() => setPendingRemoveUserId(m.user.id)}
                            disabled={isRemoving}
                            className="p-1.5 text-[#5B6E68] hover:text-red-600 transition disabled:opacity-40"
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
};
