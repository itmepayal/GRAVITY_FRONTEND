import { useState } from "react";
import {
  Crown,
  MoreHorizontal,
  UserPlus,
  Pencil,
  Trash2,
  Users,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  type NormalizedTeam,
  type TeamSizeCategory,
  TEAM_SIZE_META,
  getTeamSizeCategory,
  getInitials,
} from "./types";
import { FONT_GOLDMAN } from "@/components/common/design-system";

const KANBAN_COLUMNS: TeamSizeCategory[] = ["small", "medium", "large"];

interface TeamKanbanViewProps {
  teams: NormalizedTeam[];
  activeTeamId: string | null;
  onSelectTeam: (team: NormalizedTeam) => void;
  onOpenCreate: () => void;
  onOpenAddMember: (team: NormalizedTeam) => void;
  onOpenEdit: (team: NormalizedTeam) => void;
  onOpenDelete: (team: NormalizedTeam) => void;
}

function TeamKanbanCard({
  team,
  onSelectTeam,
  onOpenAddMember,
  onOpenEdit,
  onOpenDelete,
}: {
  team: NormalizedTeam;
  onSelectTeam: (team: NormalizedTeam) => void;
  onOpenAddMember: (team: NormalizedTeam) => void;
  onOpenEdit: (team: NormalizedTeam) => void;
  onOpenDelete: (team: NormalizedTeam) => void;
}) {
  const sizeMeta = TEAM_SIZE_META[getTeamSizeCategory(team.members.length)];
  const [menuOpen, setMenuOpen] = useState(false);
  const capacityPercent = Math.min(
    100,
    Math.round((team.members.length / 12) * 100),
  );

  return (
    <div
      className="cursor-pointer border bg-white transition-shadow hover:shadow-md"
      style={{
        borderColor: "#0F2D2922",
        borderLeft: `4px solid ${team.color || sizeMeta.color}`,
      }}
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      <div className="p-3.5">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelectTeam(team)}
            className="min-w-0 flex-1 text-left"
          >
            <p
              className={`text-sm font-bold leading-snug text-[#0F2D29] ${FONT_GOLDMAN}`}
            >
              {team.name}
            </p>
          </button>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="flex h-6 w-6 items-center justify-center text-[#0F2D29]/40"
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full z-10 mt-1 w-36 border bg-white py-1 shadow-lg"
                style={{ borderColor: "#0F2D2922" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    onOpenAddMember(team);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                >
                  <UserPlus size={12} />
                  Add Member
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenEdit(team);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#EDEBE3]"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenDelete(team);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#FBEAE9] text-[#B3261E]"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="mb-3 line-clamp-2 text-[11px] font-medium text-[#5B6E68]">
          {team.description || "No description provided."}
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: "#0F8A65", backgroundColor: "#E7F5EF" }}
          >
            <Crown size={10} />
            {team.lead.name}
          </span>
          <span
            className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ color: sizeMeta.color, backgroundColor: sizeMeta.bg }}
          >
            {team.members.length} members
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center -space-x-1.5">
            {team.members.slice(0, 3).map((m) => (
              <div
                key={m.user.id}
                className="flex h-6 w-6 items-center justify-center text-[9px] font-bold text-white ring-2 ring-white"
                style={{ backgroundColor: m.user.color }}
              >
                {m.user.initials}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onSelectTeam(team)}
            className="flex items-center gap-0.5 text-[11px] font-bold text-[#0F2D29]/70 hover:text-[#0F8A65]"
          >
            Details
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <div
        className="border-t px-3.5 py-2.5"
        style={{ borderColor: "#0F2D2915", backgroundColor: "#FAFAF7" }}
      >
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#0F2D29]/55">
          <span className="flex items-center gap-1">
            <Users size={11} />
            Team capacity
          </span>
          <span className="text-[#0F2D29]">{capacityPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#EDEBE3]">
          <div
            className="h-1.5 transition-all"
            style={{
              width: `${capacityPercent}%`,
              backgroundColor: team.color || sizeMeta.color,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const TeamKanbanView: React.FC<TeamKanbanViewProps> = ({
  teams,
  onSelectTeam,
  onOpenCreate,
  onOpenAddMember,
  onOpenEdit,
  onOpenDelete,
}) => {
  const grouped: Record<TeamSizeCategory, NormalizedTeam[]> = {
    small: [],
    medium: [],
    large: [],
  };

  teams.forEach((team) => {
    grouped[getTeamSizeCategory(team.members.length)].push(team);
  });

  return (
    <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden pb-2">
      {KANBAN_COLUMNS.map((category) => {
        const meta = TEAM_SIZE_META[category];
        const colTeams = grouped[category];

        return (
          <div key={category} className="flex max-h-full w-72 shrink-0 flex-col">
            <div className="h-0.75 w-full" style={{ backgroundColor: meta.color }} />
            <div className="flex items-center justify-between px-0.5 py-3">
              <span
                className={`flex items-center gap-2 text-sm font-black text-[#0F2D29] ${FONT_GOLDMAN}`}
              >
                {meta.label}
                <span className="flex h-5 w-5 items-center justify-center bg-[#EDEBE3] text-[11px] font-bold text-[#0F2D29]/60">
                  {colTeams.length}
                </span>
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto pb-2 pr-1">
              {colTeams.map((team) => (
                <TeamKanbanCard
                  key={team.id}
                  team={team}
                  onSelectTeam={onSelectTeam}
                  onOpenAddMember={onOpenAddMember}
                  onOpenEdit={onOpenEdit}
                  onOpenDelete={onOpenDelete}
                />
              ))}

              {colTeams.length === 0 && (
                <div className="flex flex-col items-center gap-2 border border-dashed py-8 text-center border-[#0F2D29]/15">
                  <Users size={18} className="text-[#0F2D29]/25" />
                  <p className="text-[11px] font-medium text-[#0F2D29]/45">
                    No {meta.label.toLowerCase()} teams
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={onOpenCreate}
                className="flex w-full items-center justify-center gap-1.5 border border-dashed py-2.5 text-xs font-bold text-[#0F2D29]/50 border-[#0F2D29]/20 hover:border-[#0F2D29]/40 hover:text-[#0F2D29]/70"
              >
                <Plus size={13} />
                Add Team
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Re-export for card initials if needed elsewhere
export { getInitials };
