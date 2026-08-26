import { useState } from "react";
import {
  Crown,
  MoreHorizontal,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import type { NormalizedTeam } from "./types";
import { TEAM_SIZE_META, getTeamSizeCategory } from "./types";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";

interface TeamTableViewProps {
  teams: NormalizedTeam[];
  activeTeamId: string | null;
  onSelectTeam: (team: NormalizedTeam) => void;
  onOpenCreate: () => void;
  onOpenAddMember: (team: NormalizedTeam) => void;
  onOpenEdit: (team: NormalizedTeam) => void;
  onOpenDelete: (team: NormalizedTeam) => void;
}

export const TeamTableView: React.FC<TeamTableViewProps> = ({
  teams,
  activeTeamId,
  onSelectTeam,
  onOpenAddMember,
  onOpenEdit,
  onOpenDelete,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (teams.length === 0) return null;

  return (
    <div className="overflow-x-auto border border-[#0F2D29]/15 bg-white shadow-2xs">
      <table className={`w-full text-left text-xs ${FONT_POPPINS}`}>
        <thead
          className={`border-b border-[#0F2D29]/12 bg-[#0F2D29]/5 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68] ${FONT_GOLDMAN}`}
        >
          <tr>
            <th scope="col" className="px-4 py-3.5">
              Team
            </th>
            <th scope="col" className="px-4 py-3.5">
              Size
            </th>
            <th scope="col" className="px-4 py-3.5">
              Team Lead
            </th>
            <th scope="col" className="px-4 py-3.5">
              Members
            </th>
            <th scope="col" className="px-4 py-3.5">
              Created
            </th>
            <th scope="col" className="px-4 py-3.5 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#0F2D29]/8 text-[#0F2D29]">
          {teams.map((team) => {
            const isSelected = activeTeamId === team.id;
            const sizeMeta = TEAM_SIZE_META[getTeamSizeCategory(team.members.length)];
            const visibleMembers = team.members.slice(0, 4);
            const overflowCount = team.members.length - visibleMembers.length;
            const isMenuOpen = openMenuId === team.id;

            return (
              <tr
                key={team.id}
                onClick={() => onSelectTeam(team)}
                className={`group cursor-pointer transition-colors hover:bg-[#0F2D29]/3 ${
                  isSelected ? "bg-[#0F8A65]/8" : ""
                }`}
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: team.color || "#0F2D29" }}
                    >
                      {team.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-bold text-[#0F2D29] group-hover:text-[#0F8A65] ${FONT_GOLDMAN}`}
                      >
                        {team.name}
                      </p>
                      <p className="truncate text-[11px] font-medium text-[#5B6E68] max-w-xs">
                        {team.description || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <span
                    className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      color: sizeMeta.color,
                      backgroundColor: sizeMeta.bg,
                    }}
                  >
                    {sizeMeta.label}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: team.lead.color }}
                    >
                      {team.lead.initials}
                    </div>
                    <span className="text-xs font-semibold">{team.lead.name}</span>
                    <Crown size={12} className="shrink-0 text-amber-500" />
                  </div>
                </td>

                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1.5">
                      {visibleMembers.map((m) => (
                        <div
                          key={m.user.id}
                          title={m.user.name}
                          className="flex h-6 w-6 items-center justify-center text-[9px] font-bold text-white ring-2 ring-white"
                          style={{ backgroundColor: m.user.color }}
                        >
                          {m.user.initials}
                        </div>
                      ))}
                      {overflowCount > 0 && (
                        <div className="flex h-6 w-6 items-center justify-center border border-[#0F2D29]/15 bg-[#0F2D29]/6 text-[9px] font-bold text-[#0F2D29] ring-2 ring-white">
                          +{overflowCount}
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-[#5B6E68]">
                      ({team.members.length})
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3.5 font-mono text-[11px] text-[#5B6E68]">
                  {new Date(team.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                <td className="px-4 py-3.5 text-right">
                  <div
                    className="relative inline-block text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(isMenuOpen ? null : team.id)}
                      className="rounded-lg p-1.5 text-[#5B6E68] transition-colors hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-20 w-44 border border-[#0F2D29]/15 bg-white py-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              onSelectTeam(team);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#0F2D29]/5"
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
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#0F2D29]/5"
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
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-[#0F2D29]/5"
                          >
                            <Pencil size={14} />
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
                            <Trash2 size={14} />
                            Delete
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
