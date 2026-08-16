import { useState, type FormEvent } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { type ProjectStatus, PROJECT_STATUS_META, inputClass } from "./types";

const DEFAULT_COLORS = [
  "#6366F1",
  "#0F2D29",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];

export interface AddProjectFormValues {
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  startDate: string;
  dueDate: string;
}

export const AddProjectModal = ({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (values: AddProjectFormValues) => void;
  isSubmitting: boolean;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const dateError =
    startDate && dueDate && new Date(dueDate) < new Date(startDate)
      ? "Due date can't be before start date"
      : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting || dateError) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
      color,
      startDate,
      dueDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-[#0F2D29] p-6 text-white flex items-center justify-between sticky top-0 z-10">
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

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  disabled={isSubmitting}
                  className={`w-7 h-7 rounded-full border-2 ${
                    color === c ? "border-[#0F2D29]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Choose color ${c}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isSubmitting}
                className="w-7 h-7 border border-[#0F2D29]/20 cursor-pointer bg-transparent"
                aria-label="Custom color"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={startDate || undefined}
                className={inputClass}
              />
            </div>
          </div>
          {dateError && (
            <p className="text-[12px] text-red-600 -mt-2">{dateError}</p>
          )}

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
              disabled={!name.trim() || isSubmitting || !!dateError}
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
