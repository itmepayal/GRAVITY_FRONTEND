import React, { useState } from "react";
import {
  Crown,
  MoreHorizontal,
  ChevronRight,
  UserPlus,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import type { NormalizedTeam } from "./types";

interface TeamTableViewProps {
  teams: NormalizedTeam[];
  activeTeamId: string | null;
  onSelectTeam: (team: NormalizedTeam) => void;
  onOpenCreate: () => void;
  onOpenAddMember: (team: NormalizedTeam) => void;
  onOpenEdit: (team: NormalizedTeam) => void;
  onOpenDelete: (team: NormalizedTeam) => void;
  isLoading?: boolean;
}

export const TeamTableView: React.FC<TeamTableViewProps> = ({
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
      <div className="rounded-2xl border border-[#0F2D29]/12 bg-white p-6 shadow-2xs">
        <div className="h-6 w-full animate-pulse rounded bg-[#0F2D29]/10" />
        <div className="mt-4 h-12 w-full animate-pulse rounded bg-[#0F2D29]/5" />
        <div className="mt-2 h-12 w-full animate-pulse rounded bg-[#0F2D29]/5" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white p-8 text-center shadow-2xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F2D29]/6 text-[#0F2D29]">
          <Users size={24} />
        </div>
        <h3 className="mt-4 text-base font-extrabold font-['Goldman',sans-serif] text-[#0F2D29]">
          No teams found
        </h3>
        <p className="mt-1 max-w-sm text-xs font-semibold text-[#5B6E68]">
          There are no teams matching your criteria in this workspace.
        </p>
        <button
          type="button"
          onClick={onOpenCreate}
          className="mt-5 bg-[#0F2D29] px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] transition shadow-2xs"
        >
          Create Team
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#0F2D29]/12 bg-white shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#0F2D29]/5 text-[11px] font-extrabold font-['Goldman',sans-serif] tracking-wider text-[#5B6E68] uppercase border-b border-[#0F2D29]/12">
          <tr>
            <th scope="col" className="py-3.5 px-4">Team</th>
            <th scope="col" className="py-3.5 px-4">Description</th>
            <th scope="col" className="py-3.5 px-4">Team Lead</th>
            <th scope="col" className="py-3.5 px-4">Members</th>
            <th scope="col" className="py-3.5 px-4">Created</th>
            <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0F2D29]/8 text-[#0F2D29]">
          {teams.map((team) => {
            const isSelected = activeTeamId === team.id;
            const visibleMembers = team.members.slice(0, 4);
            const overflowCount = team.members.length - visibleMembers.length;
            const isMenuOpen = openMenuId === team.id;

            return (
              <tr
                key={team.id}
                onClick={() => onSelectTeam(team)}
                className={`group cursor-pointer transition-colors hover:bg-[#0F2D29]/3 ${
                  isSelected ? "bg-[#0F8A65]/8 font-medium" : ""
                }`}
              >
                {/* Team Name */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: team.color || "#0F8A65" }}
                    />
                    <span className="font-extrabold font-['Goldman',sans-serif] text-sm text-[#0F2D29] group-hover:text-[#0F8A65] transition-colors">
                      {team.name}
                    </span>
                  </div>
                </td>

                {/* Description */}
                <td className="py-3.5 px-4 max-w-xs truncate text-[#5B6E68] font-medium">
                  {team.description || "—"}
                </td>

                {/* Lead */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold text-white shrink-0"
                      style={{ backgroundColor: team.lead.color }}
                    >
                      {team.lead.avatar ? (
                        <img
                          src={team.lead.avatar}
                          alt={team.lead.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        team.lead.initials
                      )}
                    </div>
                    <span className="font-semibold text-xs text-[#0F2D29]">
                      {team.lead.name}
                    </span>
                    <Crown size={13} className="text-amber-500 shrink-0" />
                  </div>
                </td>

                {/* Members */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1.5 overflow-hidden">
                      {visibleMembers.map((m) => (
                        <div
                          key={m.user.id}
                          title={m.user.name}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-extrabold text-white ring-2 ring-white shrink-0"
                          style={{ backgroundColor: m.user.color }}
                        >
                          {m.user.initials}
                        </div>
                      ))}
                      {overflowCount > 0 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F2D29]/6 text-[9px] font-bold text-[#0F2D29] ring-2 ring-white border border-[#0F2D29]/15">
                          +{overflowCount}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-[#5B6E68]">
                      ({team.members.length})
                    </span>
                  </div>
                </td>

                {/* Created Date */}
                <td className="py-3.5 px-4 font-mono text-[11px] text-[#5B6E68]">
                  {new Date(team.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      aria-label="Team Options"
                      onClick={() => setOpenMenuId(isMenuOpen ? null : team.id)}
                      className="p-1.5 text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-[#0F2D29]/15 bg-white shadow-xl py-1 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => {
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
                            onClick={() => {
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
                            onClick={() => {
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
                            onClick={() => {
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
