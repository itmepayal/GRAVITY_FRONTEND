import { useState, type FormEvent } from "react";
import {
  X,
  Smile,
  Palette,
  Check,
  Lock,
  Globe,
  Plus,
  Loader2,
} from "lucide-react";
import {
  type Workspace,
  WORKSPACE_COLORS,
  WORKSPACE_ICONS,
  initials,
  nextId,
  inputClass,
} from "./types";

interface CreateWorkspaceModalProps {
  onClose: () => void;
  onCreated: (ws: Workspace) => void;
  isSubmitting?: boolean;
}

export const CreateWorkspaceModal = ({
  onClose,
  onCreated,
  isSubmitting = false,
}: CreateWorkspaceModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366F1");
  const [icon, setIcon] = useState("💼");
  const [isPrivate, setIsPrivate] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2 || isSubmitting) return;

    onCreated({
      _id: nextId("ws"),
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      isPrivate,
      role: "owner",
      createdAt: new Date().toISOString().slice(0, 10),
      projects: [],
      members: [
        {
          user: {
            id: "u-1",
            name: "Payal Yadav",
            email: "itme.payalyadav@gmail.com",
          },
          role: "owner",
          joinedAt: new Date().toISOString().slice(0, 10),
        },
      ],
      roles: [],
      activityLog: [
        {
          id: nextId("act"),
          user: "Payal Yadav",
          action: "created workspace",
          target: name.trim(),
          timestamp: "Just now",
          iconType: "workspace",
        },
      ],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 p-4 backdrop-blur-sm"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden border border-[#0F2D29] bg-white shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0F2D29] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center text-[18px] font-bold shadow-sm"
                style={{ backgroundColor: color }}
              >
                {icon || (name.trim() ? initials(name.trim()) : "💼")}
              </div>
              <div>
                <h2 className="text-[17px] font-bold font-['Goldman',sans-serif] text-white">
                  Create New Workspace
                </h2>
                <p className="text-[12px] text-[#B7CFC7]">
                  Set up workspace details & privacy settings.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-8 w-8 items-center justify-center text-[#B7CFC7] transition hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <fieldset disabled={isSubmitting} className="disabled:opacity-70">
          <form onSubmit={submit} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="ws-name"
                className="mb-1.5 block text-[12px] font-semibold text-[#0F2D29]"
              >
                Workspace Name *
              </label>
              <input
                id="ws-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Engineering"
                minLength={2}
                maxLength={100}
                required
                className={inputClass}
              />
              {name && name.length < 2 && (
                <p className="mt-1 text-[11px] text-red-500">
                  Workspace name must be at least 2 characters.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="ws-desc"
                  className="text-[12px] font-semibold text-[#0F2D29]"
                >
                  Description{" "}
                  <span className="font-normal text-[#8FA69E]">(optional)</span>
                </label>
                <span className="text-[10.5px] text-[#8FA69E]">
                  {description.length}/500
                </span>
              </div>
              <textarea
                id="ws-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="What will your team collaborate on in this workspace?"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]">
                <Smile size={13} className="text-[#0F8A65]" />
                Workspace Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {WORKSPACE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-[16px] transition ${
                      icon === ic
                        ? "bg-[#0F2D29] text-white shadow-xs scale-105 ring-2 ring-[#0F2D29]/20"
                        : "bg-[#0F2D29]/5 hover:bg-[#0F2D29]/10 text-[#0F2D29]"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#0F2D29]">
                <Palette size={13} className="text-[#0F8A65]" />
                Color Accent
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                      color === c
                        ? "ring-2 ring-[#0F2D29] scale-110 shadow-sm"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={14} className="text-white" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-xl border-none bg-transparent"
                  title="Custom color picker"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#0F2D29]/10 bg-[#0F2D29]/2 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isPrivate
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isPrivate ? <Lock size={15} /> : <Globe size={15} />}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-bold text-[#0F2D29]">
                      {isPrivate ? "Private Workspace" : "Public Workspace"}
                    </p>
                    <p className="text-[11px] text-[#5B6E68]">
                      {isPrivate
                        ? "Only invited members can view and access."
                        : "Visible to anyone with workspace access."}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#0F2D29] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#0F2D29]/8">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#5B6E68] transition hover:bg-[#0F2D29]/5 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !name.trim() || name.trim().length < 2 || isSubmitting
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-5 py-2 text-[13px] font-medium text-white shadow-sm transition hover:bg-[#0F2D29]/90 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Create workspace
                  </>
                )}
              </button>
            </div>
          </form>
        </fieldset>
      </div>
    </div>
  );
};
