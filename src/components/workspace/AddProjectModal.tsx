import { useState, type FormEvent } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { type ProjectStatus, PROJECT_STATUS_META, inputClass } from "./types";

export const AddProjectModal = ({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (name: string, description: string, status: ProjectStatus) => void;
  isSubmitting: boolean;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("in-progress");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    onSubmit(name.trim(), description.trim(), status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl">
        <div className="bg-[#0F2D29] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus size={20} />
            <h2 className="text-[17px] font-bold font-['Goldman',sans-serif]">
              Create Project
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#B7CFC7] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core API Gateway"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief project goals..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={inputClass}
            >
              {(Object.keys(PROJECT_STATUS_META) as ProjectStatus[]).map(
                (st) => (
                  <option key={st} value={st}>
                    {PROJECT_STATUS_META[st].label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-[13px] font-bold text-[#5B6E68]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="bg-[#0F2D29] text-white px-5 py-2 text-[13px] font-bold font-['Goldman',sans-serif]"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
