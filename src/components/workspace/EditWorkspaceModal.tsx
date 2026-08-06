import { useState, type FormEvent } from "react";
import { X, Check } from "lucide-react";
import { type Workspace, WORKSPACE_COLORS, WORKSPACE_ICONS, inputClass } from "./types";

interface EditWorkspaceModalProps {
  workspace: Workspace;
  onClose: () => void;
  onSave: (patch: Partial<Workspace>) => void;
}

export const EditWorkspaceModal = ({
  workspace,
  onClose,
  onSave,
}: EditWorkspaceModalProps) => {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || "");
  const [color, setColor] = useState(workspace.color || "#6366F1");
  const [icon, setIcon] = useState(workspace.icon || "💼");
  const [isPrivate, setIsPrivate] = useState(workspace.isPrivate || false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      isPrivate,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#0F2D29]/10 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#0F2D29]/8 pb-4">
          <h3 className="text-[16px] font-bold text-[#0F2D29]">
            Edit Workspace Settings
          </h3>
          <button
            onClick={onClose}
            className="text-[#8FA69E] hover:text-[#0F2D29]"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-ws-name" className="mb-1.5 block text-[12px] font-semibold text-[#0F2D29]">
              Workspace Name *
            </label>
            <input
              id="edit-ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={100}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="edit-ws-desc" className="mb-1.5 block text-[12px] font-semibold text-[#0F2D29]">
              Description <span className="font-normal text-[#8FA69E]">(optional)</span>
            </label>
            <textarea
              id="edit-ws-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold text-[#0F2D29]">
              Workspace Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-[16px] transition ${icon === ic
                    ? "bg-[#0F2D29] text-white shadow-xs scale-105"
                    : "bg-[#0F2D29]/5 hover:bg-[#0F2D29]/10 text-[#0F2D29]"
                    }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatches */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold text-[#0F2D29]">
              Color Theme
            </label>
            <div className="flex flex-wrap gap-2.5">
              {WORKSPACE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${color === c ? "ring-2 ring-[#0F2D29] scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={14} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center justify-between rounded-xl border border-[#0F2D29]/10 bg-[#0F2D29]/2 p-3">
            <span className="text-[12.5px] font-bold text-[#0F2D29]">
              Private Workspace
            </span>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 accent-[#0F2D29]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#0F2D29]/8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#5B6E68]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name.trim().length < 2}
              className="rounded-xl bg-[#0F2D29] px-4 py-2 text-[13px] font-medium text-white shadow-xs disabled:opacity-40"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
