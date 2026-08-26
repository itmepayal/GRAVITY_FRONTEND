import React, { useState } from "react";
import {
  X,
  Crown,
  Plus,
  Check,
  Trash2,
  ShieldAlert,
  Users,
  Pencil,
  Loader2,
  UserPlus,
} from "lucide-react";
import {
  type NormalizedTeam,
  type NormalizedUser,
  BRAND_TEAM_PALETTE,
} from "./types";
import { FONT_GOLDMAN } from "@/components/common/design-system";

const INK = "#0F2D29";
const TEAL = "#0F8A65";
const MINT = "#8FE3C4";

interface ModalShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  maxWidth = "max-w-md",
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    onClick={onClose}
  >
    <div
      className={`w-full ${maxWidth} border bg-white shadow-2xl`}
      style={{ borderColor: `${INK}22` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center justify-between gap-4 px-6 py-5"
        style={{ backgroundColor: INK }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ backgroundColor: TEAL }}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <p className={`text-base font-black leading-none text-white ${FONT_GOLDMAN}`}>
              {title}
            </p>
            {subtitle && (
              <p
                className="mt-1 text-xs font-medium truncate"
                style={{ color: `${MINT}CC` }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

      {footer && (
        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: `${INK}15`, backgroundColor: "#FAFAF7" }}
        >
          {footer}
        </div>
      )}
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
    <ModalShell
      title="Create New Team"
      subtitle="Define team & assign team lead"
      icon={<Users size={18} color="white" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-[#0F2D29]/55"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-team-form"
            disabled={!name.trim() || !leadId || isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${FONT_GOLDMAN}`}
            style={{ backgroundColor: INK }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            {isSubmitting ? "Creating..." : "Create Team"}
          </button>
        </>
      }
    >
      <form id="create-team-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Team Name <span className="text-[#B3261E]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile Platform"
            className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this team focus on?"
            className="w-full resize-none border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Team Lead <span className="text-[#B3261E]">*</span>
          </label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email || "Workspace Member"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Team Color Tag
          </label>
          <div className="grid grid-cols-6 gap-2">
            {BRAND_TEAM_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="flex h-7 w-7 items-center justify-center ring-2 ring-white transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
                title={`Color ${c}`}
              >
                {color === c && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
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
    <ModalShell
      title="Edit Team"
      subtitle={team.name}
      icon={<Pencil size={16} color="white" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-[#0F2D29]/55"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-team-form"
            disabled={!name.trim() || isSubmitting}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40 ${FONT_GOLDMAN}`}
            style={{ backgroundColor: INK }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </>
      }
    >
      <form id="edit-team-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Team Name <span className="text-[#B3261E]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none border px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Team Color Tag
          </label>
          <div className="grid grid-cols-6 gap-2">
            {BRAND_TEAM_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="flex h-7 w-7 items-center justify-center ring-2 ring-white transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
              >
                {color === c && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
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
    <ModalShell
      title="Add Team Member"
      subtitle={team.name}
      icon={<UserPlus size={18} color="white" />}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      {candidateUsers.length === 0 ? (
        <div className="py-8 text-center text-xs font-semibold text-[#5B6E68]">
          All workspace members are already assigned to this team.
        </div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto py-1 pr-1">
          {candidateUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between border border-[#0F2D29]/12 bg-white p-2.5 transition-colors hover:bg-[#0F2D29]/3"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: u.color }}
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    u.initials
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F2D29]">{u.name}</p>
                  <p className="text-[10px] font-semibold text-[#5B6E68]">
                    {u.email || "Workspace Member"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onAdd(u.id)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-50 ${FONT_GOLDMAN}`}
                style={{ backgroundColor: INK }}
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
    <ModalShell
      title="Change Team Lead"
      subtitle={team.name}
      icon={<Crown size={16} color="white" />}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-[#0F2D29]/55"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="change-lead-form"
            disabled={
              !selectedUserId || selectedUserId === team.lead.id || isSubmitting
            }
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40 ${FONT_GOLDMAN}`}
            style={{ backgroundColor: INK }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Crown size={13} className="text-amber-300" />
            )}
            {isSubmitting ? "Updating..." : "Set Team Lead"}
          </button>
        </>
      }
    >
      <form id="change-lead-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#0F2D29]">
            Select New Team Lead
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0F8A65]"
            style={{ borderColor: `${INK}22`, color: INK }}
          >
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.id === team.lead.id ? "(Current Lead)" : ""}
              </option>
            ))}
          </select>
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
    <ModalShell
      title="Delete Team"
      subtitle="This action cannot be undone"
      icon={<Trash2 size={16} color="white" />}
      onClose={onClose}
      maxWidth="max-w-sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-[#0F2D29]/55"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isMatch || isSubmitting}
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${FONT_GOLDMAN}`}
            style={{ backgroundColor: "#B3261E" }}
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            {isSubmitting ? "Deleting..." : "Delete Team"}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <div
          className="flex items-start gap-3 border p-3"
          style={{
            borderColor: "#F3B8B4",
            backgroundColor: "#FBEAE9",
            color: "#B3261E",
          }}
        >
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="font-bold">{teamName}</strong>? This will
            permanently remove team assignments.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#B3261E]">
            Type team name to confirm:{" "}
            <span className="text-[#0F2D29]">"{teamName}"</span>
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={`Type "${teamName}"`}
            className="w-full border px-3 py-2.5 text-sm font-medium outline-none focus:border-[#B3261E]"
            style={{
              borderColor: isMatch ? "#B3261E" : `${INK}22`,
              color: INK,
              backgroundColor: isMatch ? "#FBEAE9" : "white",
            }}
            autoFocus
          />
        </div>
      </div>
    </ModalShell>
  );
};
