import React from "react";
import {
  X,
  Crown,
  UserPlus,
  UserMinus,
  Shield,
  Edit2,
  Trash2,
  Calendar,
  Users,
} from "lucide-react";
import type { NormalizedTeam } from "./types";

interface TeamDetailDrawerProps {
  team: NormalizedTeam | null;
  onClose: () => void;
  onOpenAddMember: () => void;
  onOpenChangeLead: () => void;
  onRemoveMember: (userId: string) => void;
  onOpenEdit: () => void;
  onOpenDelete: () => void;
}

export const TeamDetailDrawer: React.FC<TeamDetailDrawerProps> = ({
  team,
  onClose,
  onOpenAddMember,
  onOpenChangeLead,
  onRemoveMember,
  onOpenEdit,
  onOpenDelete,
}) => {
  if (!team) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10 border-l border-[#0F2D29]/15 animate-in slide-in-from-right duration-200">
        {/* Color stripe */}
        <div
          className="h-2 w-full"
          style={{ backgroundColor: team.color || "#0F8A65" }}
        />

        {/* Drawer Header */}
        <div className="p-6 border-b border-[#0F2D29]/12 flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: team.color || "#0F8A65" }}
              />
              <h2 className="text-xl font-extrabold font-['Goldman',sans-serif] text-[#0F2D29] truncate">
                {team.name}
              </h2>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs font-mono font-semibold text-[#5B6E68]">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                Created{" "}
                {new Date(team.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                {team.members.length} member{team.members.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenEdit}
              title="Edit Team"
              className="p-2 text-[#0F2D29] hover:bg-[#0F2D29]/5 rounded-lg transition-colors border border-[#0F2D29]/15"
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={onOpenDelete}
              title="Delete Team"
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <Trash2 size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* About Section */}
          <div>
            <h4 className="text-[11px] font-extrabold font-['Goldman',sans-serif] tracking-wider text-[#5B6E68] uppercase mb-2">
              About Team
            </h4>
            <p className="text-xs font-medium text-[#0F2D29]/80 bg-[#0F2D29]/5 p-3.5 rounded-xl border border-[#0F2D29]/10 leading-relaxed">
              {team.description || "No description provided for this team."}
            </p>
          </div>

          {/* Team Lead Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[11px] font-extrabold font-['Goldman',sans-serif] tracking-wider text-[#5B6E68] uppercase">
                Team Lead
              </h4>
              <button
                type="button"
                onClick={onOpenChangeLead}
                className="text-xs font-bold font-['Goldman',sans-serif] text-[#0F8A65] hover:underline"
              >
                Change Lead
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold text-white shrink-0 shadow-2xs"
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
                <div>
                  <p className="text-xs font-bold text-[#0F2D29]">
                    {team.lead.name}
                  </p>
                  <p className="text-[11px] font-semibold text-[#5B6E68]">
                    {team.lead.email || "Team Leader"}
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-[11px] font-extrabold font-['Goldman',sans-serif] text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-300">
                <Crown size={13} className="text-amber-600" />
                Team Lead
              </span>
            </div>
          </div>

          {/* Members Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-extrabold font-['Goldman',sans-serif] tracking-wider text-[#5B6E68] uppercase">
                Team Members ({team.members.length})
              </h4>
              <button
                type="button"
                onClick={onOpenAddMember}
                className="flex items-center gap-1.5 bg-[#0F2D29] px-3 py-1.5 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] transition shadow-2xs"
              >
                <UserPlus size={13} />
                Add Member
              </button>
            </div>

            <div className="space-y-2">
              {team.members.map((m) => {
                const isLead = m.user.id === team.lead.id;

                return (
                  <div
                    key={m.user.id}
                    className="flex items-center justify-between rounded-xl border border-[#0F2D29]/12 bg-white p-3 hover:border-[#0F2D29]/25 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white shrink-0 shadow-2xs"
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
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F2D29] truncate">
                          {m.user.name}
                        </p>
                        <p className="font-mono text-[10px] font-semibold text-[#5B6E68]">
                          Joined{" "}
                          {new Date(m.joinedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isLead ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Shield size={11} />
                          Lead
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.user.id)}
                          title="Remove from team"
                          className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-200"
                        >
                          <UserMinus size={13} />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
