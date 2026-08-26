import {
  Layers,
  Users,
  Plus,
  ChevronRight,
  MoreHorizontal,
  Lock,
  Globe,
} from "lucide-react";
import type { Workspace } from "./types";
import {
  VISIBILITY_META,
  ROLE_META,
  initials,
  type Role,
} from "./types";
import { AvatarStack } from "./WorkspaceListItem";
import { FONT_GOLDMAN } from "@/components/common/design-system";

const KANBAN_COLUMNS = ["public", "private"] as const;
type VisibilityColumn = (typeof KANBAN_COLUMNS)[number];

interface WorkspaceKanbanViewProps {
  workspaces: Workspace[];
  activeId: string | null;
  onSelectWorkspace: (id: string) => void;
  onOpenCreate: () => void;
}

function WorkspaceKanbanCard({
  workspace,
  onSelect,
}: {
  workspace: Workspace;
  onSelect: () => void;
}) {
  const normalizedRole = (workspace.role || "member").toLowerCase() as Role;
  const roleMeta = ROLE_META[normalizedRole];
  const RoleIcon = roleMeta?.icon ?? Users;
  const projectProgress =
    workspace.projects.length > 0
      ? Math.round(
          (workspace.projects.filter((p) => p.status === "completed").length /
            workspace.projects.length) *
            100,
        )
      : 0;

  return (
    <div
      className="cursor-pointer border bg-white transition-shadow hover:shadow-md"
      style={{
        borderColor: "#0F2D2922",
        borderLeft: `4px solid ${workspace.color || "#0F8A65"}`,
      }}
      onClick={onSelect}
    >
      <div className="p-3.5">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold text-[#0F2D29]"
              style={{ backgroundColor: workspace.color || "#8FE3C4" }}
            >
              {workspace.icon || initials(workspace.name)}
            </div>
            <p
              className={`truncate text-sm font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}
            >
              {workspace.name}
            </p>
          </div>
          <MoreHorizontal size={14} className="shrink-0 text-[#0F2D29]/40" />
        </div>

        <p className="mb-3 line-clamp-2 text-[11px] font-medium text-[#5B6E68]">
          {workspace.description || "No description provided."}
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${roleMeta?.badge ?? ""}`}
          >
            <RoleIcon size={10} />
            {roleMeta?.label ?? workspace.role}
          </span>
          <span className="inline-flex items-center gap-1 bg-[#0F2D29]/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5B6E68]">
            <Layers size={10} />
            {workspace.projects.length} projects
          </span>
        </div>

        <div className="flex items-center justify-between">
          <AvatarStack
            members={workspace.members.slice(0, 3)}
            extra={Math.max(0, workspace.members.length - 3)}
          />
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#0F2D29]/60">
            Open
            <ChevronRight size={12} />
          </span>
        </div>
      </div>

      <div
        className="border-t px-3.5 py-2.5"
        style={{ borderColor: "#0F2D2915", backgroundColor: "#FAFAF7" }}
      >
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#0F2D29]/55">
          <span>Delivery progress</span>
          <span className="text-[#0F2D29]">{projectProgress}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#EDEBE3]">
          <div
            className="h-1.5 transition-all"
            style={{
              width: `${projectProgress}%`,
              backgroundColor: workspace.color || "#0F8A65",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const WorkspaceKanbanView: React.FC<WorkspaceKanbanViewProps> = ({
  workspaces,
  onSelectWorkspace,
  onOpenCreate,
}) => {
  const grouped: Record<VisibilityColumn, Workspace[]> = {
    public: [],
    private: [],
  };

  workspaces.forEach((ws) => {
    const key: VisibilityColumn = ws.isPrivate ? "private" : "public";
    grouped[key].push(ws);
  });

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden pb-2">
      {KANBAN_COLUMNS.map((column) => {
        const meta = VISIBILITY_META[column];
        const MetaIcon = meta.icon;
        const colWorkspaces = grouped[column];

        return (
          <div key={column} className="flex max-h-full w-80 shrink-0 flex-col">
            <div className="h-0.75 w-full" style={{ backgroundColor: meta.color }} />
            <div className="flex items-center justify-between px-0.5 py-3">
              <span
                className={`flex items-center gap-2 text-sm font-black text-[#0F2D29] ${FONT_GOLDMAN}`}
              >
                <MetaIcon size={13} style={{ color: meta.color }} />
                {meta.label}
                <span className="flex h-5 w-5 items-center justify-center bg-[#EDEBE3] text-[11px] font-bold text-[#0F2D29]/60">
                  {colWorkspaces.length}
                </span>
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto pb-2 pr-1">
              {colWorkspaces.map((ws) => (
                <WorkspaceKanbanCard
                  key={ws._id}
                  workspace={ws}
                  onSelect={() => onSelectWorkspace(ws._id)}
                />
              ))}

              {colWorkspaces.length === 0 && (
                <div className="flex flex-col items-center gap-2 border border-dashed py-8 text-center border-[#0F2D29]/15">
                  {column === "public" ? (
                    <Globe size={18} className="text-[#0F2D29]/25" />
                  ) : (
                    <Lock size={18} className="text-[#0F2D29]/25" />
                  )}
                  <p className="text-[11px] font-medium text-[#0F2D29]/45">
                    No {meta.label.toLowerCase()}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenCreate}
                className="flex w-full items-center justify-center gap-1.5 border border-dashed py-2.5 text-xs font-bold text-[#0F2D29]/50 border-[#0F2D29]/20 hover:border-[#0F2D29]/40 hover:text-[#0F2D29]/70"
              >
                <Plus size={13} />
                New Workspace
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
