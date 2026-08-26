import { useState } from "react";
import {
  Crown,
  MoreHorizontal,
  UserPlus,
  Pencil,
  Trash2,
  Users,
  Plus,
  Building2,
} from "lucide-react";
import type { NormalizedTeam } from "./types";
import { TEAM_SIZE_META, getTeamSizeCategory, getInitials } from "./types";
import { FONT_GOLDMAN } from "@/components/common/design-system";

interface TeamGridViewProps {
  teams: NormalizedTeam[];
  activeTeamId: string | null;
  onSelectTeam: (team: NormalizedTeam) => void;
  onOpenCreate: () => void;
  onOpenAddMember: (team: NormalizedTeam) => void;
  onOpenEdit: (team: NormalizedTeam) => void;
  onOpenDelete: (team: NormalizedTeam) => void;
}

export const TeamGridView: React.FC<TeamGridViewProps> = ({
  teams,
  activeTeamId,
  onSelectTeam,
  onOpenCreate,
  onOpenAddMember,
  onOpenEdit,
  onOpenDelete,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (teams.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => {
        const isSelected = activeTeamId === team.id;
        const sizeMeta = TEAM_SIZE_META[getTeamSizeCategory(team.members.length)];
        const capacityPercent = Math.min(
          100,
          Math.round((team.members.length / 12) * 100),
        );
        const isMenuOpen = openMenuId === team.id;
        const visibleMembers = team.members.slice(0, 4);
        const overflowCount = team.members.length - visibleMembers.length;

        return (
          <div
            key={team.id}
            className={`group relative flex cursor-pointer flex-col justify-between border bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-[#0F2D29] hover:shadow-md ${
              isSelected
                ? "border-[#0F2D29] ring-2 ring-[#0F2D29]/15"
                : "border-[#0F2D29]/15"
            }`}
            onClick={() => onSelectTeam(team)}
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center text-[13px] font-bold text-white shadow-2xs ${FONT_GOLDMAN}`}
                    style={{ backgroundColor: team.color || "#0F2D29" }}
                  >
                    {getInitials(team.name)}
                  </div>
                  <span className="truncate text-[12px] font-bold text-[#5B6E68]">
                    {team.workspaceName || "Workspace"}
                  </span>
                </div>

                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(isMenuOpen ? null : team.id)}
                    className="flex h-7 w-7 items-center justify-center text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                  >
                    <MoreHorizontal size={15} />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-8 z-20 w-40 border border-[#0F2D29]/15 bg-white py-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenAddMember(team);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#0F2D29]/5"
                        >
                          <UserPlus size={13} className="text-[#0F8A65]" />
                          Add Member
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenEdit(team);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#0F2D29]/5"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <div className="my-1 border-t border-[#0F2D29]/10" />
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenDelete(team);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <h3
                className={`truncate text-[18px] font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}
              >
                {team.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-[13px] font-medium leading-relaxed text-[#5B6E68]">
                {team.description || "No description provided for this team."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 border px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider"
                  style={{
                    color: sizeMeta.color,
                    backgroundColor: sizeMeta.bg,
                    borderColor: `${sizeMeta.color}33`,
                  }}
                >
                  <Users size={11} />
                  {sizeMeta.label}
                </span>
                <span className="inline-flex items-center gap-1 border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-amber-700">
                  <Crown size={11} />
                  {team.lead.name}
                </span>
              </div>

              <div className="mt-5 space-y-1.5">
                <div
                  className={`flex items-center justify-between text-[11.5px] font-bold ${FONT_GOLDMAN}`}
                >
                  <span className="text-[#5B6E68]">Team Capacity</span>
                  <span className="text-[#0F2D29]">{capacityPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden bg-[#0F2D29]/10">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${capacityPercent}%`,
                      backgroundColor: team.color || sizeMeta.color,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#0F2D29]/10 pt-4">
              <div className="flex items-center gap-3 text-[12px] font-semibold text-[#5B6E68]">
                <span className="flex items-center gap-1">
                  <Users size={14} className="text-[#0F2D29]" />
                  {team.members.length} Members
                </span>
                <span className="flex items-center gap-1">
                  <Building2 size={14} className="text-[#0F2D29]" />
                  Lead assigned
                </span>
              </div>

              <div className="flex items-center -space-x-1.5 shrink-0">
                {visibleMembers.map((m) => (
                  <div
                    key={m.user.id}
                    title={m.user.name}
                    className="flex h-7 w-7 items-center justify-center text-[9px] font-bold text-white ring-2 ring-white"
                    style={{ backgroundColor: m.user.color }}
                  >
                    {m.user.initials}
                  </div>
                ))}
                {overflowCount > 0 && (
                  <div className="flex h-7 w-7 items-center justify-center border border-[#0F2D29]/15 bg-[#0F2D29]/6 text-[9px] font-bold text-[#0F2D29] ring-2 ring-white">
                    +{overflowCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onOpenCreate}
        className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white p-6 text-center transition hover:border-[#0F2D29]/40 hover:bg-[#0F2D29]/2"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center bg-[#0F2D29]/8 text-[#0F2D29]">
          <Plus size={22} />
        </div>
        <p className={`text-sm font-bold text-[#0F2D29] ${FONT_GOLDMAN}`}>
          Create New Team
        </p>
        <p className="mt-1 text-xs font-medium text-[#5B6E68]">
          Organize members into squads
        </p>
      </button>
    </div>
  );
};
