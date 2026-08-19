import React, { useState } from "react";
import {
  Crown,
  ChevronRight,
  UserPlus,
  MoreVertical,
  Edit2,
  Trash2,
  Users,
  Shield,
  Building2,
} from "lucide-react";
import type { NormalizedTeam } from "./types";

interface TeamGridViewProps {
  teams: NormalizedTeam[];
  activeTeamId: string | null;
  onSelectTeam: (team: NormalizedTeam) => void;
  onOpenCreate: () => void;
  onOpenAddMember: (team: NormalizedTeam) => void;
  onOpenEdit: (team: NormalizedTeam) => void;
  onOpenDelete: (team: NormalizedTeam) => void;
  isLoading?: boolean;
}

export const TeamGridView: React.FC<TeamGridViewProps> = ({
  teams,
  activeTeamId,
  onSelectTeam,
  onOpenCreate,
  onOpenAddMember,
  onOpenEdit,
  onOpenDelete,
  isLoading,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border border-[#0F2D29]/12 bg-white p-5"
          >
            <div className="h-5 w-3/4 bg-[#0F2D29]/10 rounded" />
            <div className="mt-3 h-4 w-full bg-[#0F2D29]/5 rounded" />
            <div className="mt-2 h-4 w-2/3 bg-[#0F2D29]/5 rounded" />
            <div className="mt-8 flex justify-between">
              <div className="h-8 w-24 rounded-full bg-[#0F2D29]/10" />
              <div className="h-8 w-16 bg-[#0F2D29]/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center border border-dashed border-[#0F2D29]/15 bg-white p-8 text-center shadow-2xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F2D29]/6 text-[#0F2D29]">
          <Users size={28} />
        </div>
        <h3 className="mt-4 text-base font-extrabold font-['Goldman',sans-serif] text-[#0F2D29]">
          No teams found
        </h3>
        <p className="mt-1 max-w-sm text-xs font-semibold text-[#5B6E68]">
          There are no teams in this workspace matching your filter. Create a team to collaborate.
        </p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="mt-5 flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[13px] font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] transition shadow-2xs"
        >
          <Building2 size={15} />
          Create New Team
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => {
        const isSelected = activeTeamId === team.id;
        const visibleMembers = team.members.slice(0, 4);
        const overflowCount = team.members.length - visibleMembers.length;
        const isMenuOpen = openMenuId === team.id;

        return (
          <div
            key={team.id}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
              isSelected
                ? "border-[#0F2D29] ring-2 ring-[#0F2D29]/20"
                : "border-[#0F2D29]/12 hover:border-[#0F2D29]/30"
            }`}
          >
            {/* Top Bar Indicator */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: team.color || "#0F8A65" }}
            />

            {/* Content Top */}
            <div>
              <div className="flex items-start justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectTeam(team)}
                  className="group/title min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: team.color || "#0F8A65" }}
                    />
                    <h3 className="truncate text-base font-extrabold font-['Goldman',sans-serif] text-[#0F2D29] group-hover/title:text-[#0F8A65] transition-colors">
                      {team.name}
                    </h3>
                  </div>
                </button>

                {/* Dropdown Options Button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="Team Options"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : team.id);
                    }}
                    className="p-1.5 text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] transition-colors rounded-lg"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                      />
                      <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-[#0F2D29]/15 bg-white shadow-xl py-1 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onSelectTeam(team);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-[#0F2D29] hover:bg-[#0F2D29]/5"
                        >
                          <ChevronRight size={14} className="text-[#0F8A65]" />
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onOpenAddMember(team);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-[#0F2D29] hover:bg-[#0F2D29]/5"
                        >
                          <UserPlus size={14} className="text-[#0F8A65]" />
                          Add Member
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onOpenEdit(team);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-[#0F2D29] hover:bg-[#0F2D29]/5"
                        >
                          <Edit2 size={14} className="text-[#0F2D29]" />
                          Edit Team
                        </button>
                        <div className="my-1 border-t border-[#0F2D29]/10" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                            onOpenDelete(team);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete Team
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="mt-2 line-clamp-2 text-xs font-medium text-[#5B6E68] min-h-[2.5em]">
                {team.description || "No description provided."}
              </p>
            </div>

            {/* Middle Section: Lead info */}
            <div className="mt-4 pt-3 border-t border-[#0F2D29]/8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold font-['Goldman',sans-serif] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                  <Crown size={12} className="text-amber-500" />
                  Lead:
                </span>
                <span className="text-xs font-semibold text-[#0F2D29] truncate max-w-[120px]">
                  {team.lead.name}
                </span>
              </div>

              <span className="text-[11.5px] font-bold font-mono text-[#5B6E68]">
                {team.members.length} {team.members.length === 1 ? "member" : "members"}
              </span>
            </div>

            {/* Bottom section: Member avatar stack & Details button */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#0F2D29]/8">
              <div className="flex items-center -space-x-2 overflow-hidden">
                {visibleMembers.map((m) => (
                  <div
                    key={m.user.id}
                    title={m.user.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold text-white ring-2 ring-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: m.user.color }}
                  >
                    {m.user.avatar ? (
                      <img
                        src={m.user.avatar}
                        alt={m.user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      m.user.initials
                    )}
                  </div>
                ))}

                {overflowCount > 0 && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F2D29]/6 text-[10px] font-extrabold text-[#0F2D29] ring-2 ring-white border border-[#0F2D29]/15">
                    +{overflowCount}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelectTeam(team)}
                className="flex items-center gap-1 text-xs font-extrabold font-['Goldman',sans-serif] text-[#0F2D29] hover:text-[#0F8A65] transition-colors"
              >
                <span>Inspect</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
