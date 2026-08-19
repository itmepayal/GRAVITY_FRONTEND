import React, { useState } from "react";
import { X, Crown, Plus, Check, Trash2, ShieldAlert } from "lucide-react";
import { type NormalizedTeam, type NormalizedUser, BRAND_TEAM_PALETTE } from "./types";

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  onClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    />
    <div className="relative w-full max-w-md rounded-2xl border border-[#0F2D29]/15 bg-white p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
      <div className="flex items-start justify-between mb-4 border-b border-[#0F2D29]/10 pb-3">
        <div>
          <h2 className="text-base font-extrabold font-['Goldman',sans-serif] text-[#0F2D29]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-semibold text-[#5B6E68] mt-0.5">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[#5B6E68] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// --- Create Team Modal ---
interface CreateTeamModalProps {
  onClose: () => void;
  availableUsers: NormalizedUser[];
  onSubmit: (data: {
    name: string;
    description: string;
    color: string;
    leadId: string;
  }) => void;
  isSubmitting?: boolean;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  onClose,
  availableUsers,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(BRAND_TEAM_PALETTE[0]);
  const [leadId, setLeadId] = useState(availableUsers[0]?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !leadId) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      color,
      leadId,
    });
  };

  return (
    <ModalShell title="Create New Team" subtitle="Define team & assign team lead" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1">
            Team Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile Platform"
            className="w-full rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-xs font-medium text-[#0F2D29] outline-none focus:border-[#0F2D29]"
            autoFocus
          />
        </div>

        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this team focus on?"
            className="w-full rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-xs font-medium text-[#0F2D29] outline-none focus:border-[#0F2D29] resize-none"
          />
        </div>

        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1">
            Team Lead *
          </label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="w-full rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-xs font-medium text-[#0F2D29] outline-none focus:border-[#0F2D29]"
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email || "Workspace Member"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1.5">
            Team Color Tag
          </label>
          <div className="grid grid-cols-6 gap-2">
            {BRAND_TEAM_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-white shadow-xs"
                style={{ backgroundColor: c }}
                title={`Color ${c}`}
              >
                {color === c && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !leadId || isSubmitting}
            className="rounded-lg bg-[#0F2D29] px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] disabled:opacity-50 transition"
          >
            {isSubmitting ? "Creating..." : "Create Team"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

// --- Edit Team Modal ---
interface EditTeamModalProps {
  team: NormalizedTeam;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; color: string }) => void;
  isSubmitting?: boolean;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  team,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description);
  const [color, setColor] = useState(team.color || BRAND_TEAM_PALETTE[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      color,
    });
  };

  return (
    <ModalShell title="Edit Team Details" subtitle={team.name} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1">
            Team Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-xs font-medium text-[#0F2D29] outline-none focus:border-[#0F2D29]"
          />
        </div>

        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-xs font-medium text-[#0F2D29] outline-none focus:border-[#0F2D29] resize-none"
          />
        </div>

        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1.5">
            Team Color Tag
          </label>
          <div className="grid grid-cols-6 gap-2">
            {BRAND_TEAM_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ring-2 ring-white shadow-xs"
                style={{ backgroundColor: c }}
                title={`Color ${c}`}
              >
                {color === c && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="rounded-lg bg-[#0F2D29] px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] disabled:opacity-50 transition"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

// --- Add Member Modal ---
interface AddMemberModalProps {
  team: NormalizedTeam;
  availableUsers: NormalizedUser[];
  onClose: () => void;
  onAdd: (userId: string) => void;
  isSubmitting?: boolean;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  team,
  availableUsers,
  onClose,
  onAdd,
  isSubmitting,
}) => {
  const currentMemberIds = new Set(team.members.map((m) => m.user.id));
  const candidateUsers = availableUsers.filter(
    (u) => !currentMemberIds.has(u.id)
  );

  return (
    <ModalShell title="Add Team Member" subtitle={team.name} onClose={onClose}>
      {candidateUsers.length === 0 ? (
        <div className="py-8 text-center text-xs font-semibold text-[#5B6E68]">
          All workspace members are already assigned to this team.
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto py-1 pr-1">
          {candidateUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-[#0F2D29]/12 p-2.5 bg-white hover:bg-[#0F2D29]/3 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold text-white shrink-0"
                  style={{ backgroundColor: u.color }}
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    u.initials
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F2D29]">{u.name}</p>
                  <p className="text-[10px] font-semibold text-[#5B6E68]">{u.email || "Workspace Member"}</p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onAdd(u.id)}
                className="flex items-center gap-1 rounded-lg bg-[#0F2D29] px-2.5 py-1 text-[11px] font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] disabled:opacity-50 transition"
              >
                <Plus size={12} />
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
};

// --- Change Lead Modal ---
interface ChangeLeadModalProps {
  team: NormalizedTeam;
  availableUsers: NormalizedUser[];
  onClose: () => void;
  onChangeLead: (userId: string) => void;
  isSubmitting?: boolean;
}

export const ChangeLeadModal: React.FC<ChangeLeadModalProps> = ({
  team,
  availableUsers,
  onClose,
  onChangeLead,
  isSubmitting,
}) => {
  const [selectedUserId, setSelectedUserId] = useState(team.lead.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || selectedUserId === team.lead.id) return;
    onChangeLead(selectedUserId);
  };

  return (
    <ModalShell title="Change Team Lead" subtitle={team.name} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1">
            Select New Team Lead
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-xs font-medium text-[#0F2D29] outline-none focus:border-[#0F2D29]"
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === team.lead.id ? "(Current Lead)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedUserId || selectedUserId === team.lead.id || isSubmitting}
            className="flex items-center gap-1.5 rounded-lg bg-[#0F2D29] px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] disabled:opacity-50 transition"
          >
            <Crown size={13} className="text-amber-400" />
            {isSubmitting ? "Updating..." : "Set Team Lead"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

// --- Delete Team Modal (with verification name input) ---
interface DeleteTeamModalProps {
  teamName: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const DeleteTeamModal: React.FC<DeleteTeamModalProps> = ({
  teamName,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  const [typedName, setTypedName] = useState("");
  const isMatch = typedName.trim().toLowerCase() === teamName.trim().toLowerCase();

  return (
    <ModalShell title="Delete Team" onClose={onClose}>
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/60 p-3 text-red-900">
          <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            Are you sure you want to delete <strong className="font-bold underline">{teamName}</strong>?
            This will permanently remove team assignments and cannot be undone.
          </p>
        </div>

        <div>
          <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-red-700 uppercase tracking-wider mb-1">
            Type team name to confirm: <span className="text-[#0F2D29] font-bold">"{teamName}"</span>
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={`Type "${teamName}"`}
            className={`w-full rounded-lg border px-3 py-2 text-xs font-medium outline-none transition ${isMatch
              ? "border-red-500 bg-red-50/30 text-red-900 font-bold"
              : "border-[#0F2D29]/20 bg-[#0F2D29]/3 text-[#0F2D29] focus:border-red-400"
              }`}
            autoFocus
          />
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isMatch || isSubmitting}
            onClick={onConfirm}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-red-700 disabled:opacity-40 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
          >
            <Trash2 size={13} />
            {isSubmitting ? "Deleting..." : "Delete Team"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
