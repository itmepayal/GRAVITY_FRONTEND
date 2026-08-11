import { useEffect, useState } from "react";
import {
  FolderKanban,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Pencil,
  Check,
} from "lucide-react";
import { type Project, PROJECT_STATUS_META, inputClass } from "./types";
import { useGetProjectById } from "@/hooks/queries/project/use-get-project-by-id";
import { useUpdateProject } from "@/hooks/mutations/project/use-update-project";

interface ProjectDetailModalProps {
  workspaceId?: string;
  project: Project;
  canManage?: boolean;
  onClose: () => void;
  onUpdated?: (patch: Partial<Project>) => void;
}

const formatRelativeTime = (iso?: string) => {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
};

export const ProjectDetailModal = ({
  workspaceId = "",
  project,
  canManage = false,
  onClose,
  onUpdated,
}: ProjectDetailModalProps) => {
  const {
    data: projectResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetProjectById(workspaceId, project._id);

  const { mutate: updateProjectMutation, isPending: isSaving } =
    useUpdateProject();

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [descDraft, setDescDraft] = useState(project.description ?? "");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isEditing]);

  const fetched = projectResponse?.data ?? projectResponse;
  const current: Project = fetched
    ? {
        _id: fetched._id ?? fetched.id ?? project._id,
        name: fetched.name ?? project.name,
        description: fetched.description ?? project.description,
        status: fetched.status ?? project.status,
        taskCount: fetched.taskCount ?? project.taskCount,
        completedTaskCount:
          fetched.completedTaskCount ?? project.completedTaskCount,
        updatedAt: fetched.updatedAt ?? project.updatedAt,
      }
    : project;

  const StatusIcon = PROJECT_STATUS_META[current.status].icon;
  const pct =
    current.taskCount > 0
      ? Math.round((current.completedTaskCount / current.taskCount) * 100)
      : 0;
  const remaining = Math.max(current.taskCount - current.completedTaskCount, 0);
  const updatedLabel = formatRelativeTime(current.updatedAt);

  const startEditing = () => {
    setNameDraft(current.name);
    setDescDraft(current.description ?? "");
    setIsEditing(true);
  };

  const saveEdit = () => {
    const trimmedName = nameDraft.trim();
    if (!trimmedName) return;

    const trimmedDescription = descDraft.trim() || undefined;

    // Nothing actually changed — just close the editor.
    if (
      trimmedName === current.name &&
      trimmedDescription === (current.description ?? undefined)
    ) {
      setIsEditing(false);
      return;
    }

    updateProjectMutation(
      {
        workspaceId,
        projectId: current._id,
        data: { name: trimmedName, description: trimmedDescription },
      },
      {
        onSuccess: () => {
          onUpdated?.({ name: trimmedName, description: trimmedDescription });
          setIsEditing(false);
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/45 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="w-full max-w-lg rounded-2xl border border-[#0F2D29]/10 bg-white p-6 shadow-2xl shadow-[#0F2D29]/20 animate-[modalIn_0.18s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#0F2D29]/8 pb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8FE3C4]/20 text-[#0F8A65]">
              <FolderKanban size={22} />
            </div>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className={`${inputClass} text-[15px] font-bold`}
                  placeholder="Project title"
                />
              ) : (
                <h3
                  id="project-modal-title"
                  className="truncate text-[17px] font-bold text-[#0F2D29]"
                >
                  {current.name}
                </h3>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-semibold border ${
                    PROJECT_STATUS_META[current.status].badge
                  }`}
                >
                  <StatusIcon size={11} />
                  {PROJECT_STATUS_META[current.status].label}
                </span>
                {isFetching && !isLoading && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#8FA69E]">
                    <Loader2 size={10} className="animate-spin" />
                    Refreshing
                  </span>
                )}
                {!isFetching && updatedLabel && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-[#8FA69E]">
                    <Clock size={10} />
                    Updated {updatedLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {canManage && !isEditing && (
              <button
                onClick={startEditing}
                aria-label="Edit project"
                className="rounded-lg p-1.5 text-[#8FA69E] transition-colors hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8A65]/40"
              >
                <Pencil size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close project overview"
              className="rounded-lg p-1 text-[#8FA69E] transition-colors hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8A65]/40"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14">
            <Loader2 size={20} className="animate-spin text-[#0F8A65]" />
            <p className="text-[12px] text-[#5B6E68]">Loading project…</p>
          </div>
        ) : (
          <>
            {isError && (
              <div className="my-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-500"
                />
                <div>
                  <p className="text-[12.5px] font-medium text-[#0F2D29]">
                    Couldn't load the latest details
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#8FA69E]">
                    Showing the last known info below.
                  </p>
                </div>
              </div>
            )}

            <div className="my-5 space-y-4">
              <div>
                <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-[#8FA69E]">
                  Description
                </h4>
                {isEditing ? (
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    placeholder="Brief project goal or summary..."
                    rows={3}
                    className={`${inputClass} mt-1.5 resize-none`}
                  />
                ) : (
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#5B6E68]">
                    {current.description || "No project overview provided."}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-[#0F2D29]/8 bg-[#0F2D29]/3 p-4">
                <div className="flex items-center justify-between text-[12.5px] font-bold text-[#0F2D29]">
                  <span>Task Completion Rate</span>
                  <span className="tabular-nums text-[#0F8A65]">{pct}%</span>
                </div>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#0F2D29]/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#0F8A65] to-[#3DBA8F] transition-[width] duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="mt-3 flex items-center gap-4 text-[11.5px] text-[#8FA69E]">
                  <span>
                    <span className="font-semibold text-[#0F2D29]">
                      {current.completedTaskCount}
                    </span>{" "}
                    completed
                  </span>
                  <span className="h-3 w-px bg-[#0F2D29]/10" />
                  <span>
                    <span className="font-semibold text-[#0F2D29]">
                      {remaining}
                    </span>{" "}
                    remaining
                  </span>
                  <span className="h-3 w-px bg-[#0F2D29]/10" />
                  <span>
                    <span className="font-semibold text-[#0F2D29]">
                      {current.taskCount}
                    </span>{" "}
                    total
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-2.5 border-t border-[#0F2D29]/8 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#5B6E68] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={!nameDraft.trim() || isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-5 py-2 text-[13px] font-medium text-white shadow-xs transition-colors hover:bg-[#0F2D29]/90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8A65]/40"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="rounded-xl bg-[#0F2D29] px-5 py-2 text-[13px] font-medium text-white shadow-xs transition-colors hover:bg-[#0F2D29]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8A65]/40"
            >
              Close Overview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
