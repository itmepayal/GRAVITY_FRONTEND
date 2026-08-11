import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { FolderKanban, Pencil, X, Loader2 } from "lucide-react";
import { type Project, type ProjectStatus, STATUS_META } from "./types";

export const CreateProjectDialogModal = ({
  workspaces,
  selectedWorkspaceId,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  workspaces: { id: string; name: string }[];
  selectedWorkspaceId: string;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    workspaceId: string;
    status: ProjectStatus;
  }) => void;
  isSubmitting: boolean;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workspaceId, setWorkspaceId] = useState(
    selectedWorkspaceId !== "all"
      ? selectedWorkspaceId
      : (workspaces[0]?.id ?? ""),
  );
  const [status, setStatus] = useState<ProjectStatus>("planning");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspaceId || isSubmitting) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      workspaceId,
      status,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#0F2D29] p-6 text-white">
          <div className="flex items-center gap-3">
            <FolderKanban size={20} />
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
              placeholder="e.g. Mobile App Redesign"
              className="w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Workspace *
            </label>
            <select
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-bold text-[#0F2D29] outline-none font-['Goldman',sans-serif]"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Project objectives..."
              className="w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-bold text-[#0F2D29] outline-none font-['Goldman',sans-serif] uppercase"
            >
              {(Object.keys(STATUS_META) as ProjectStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st].label}
                </option>
              ))}
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
                "Save Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export const EditProjectDialogModal = ({
  project,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  project: Project;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    status: ProjectStatus;
  }) => void;
  isSubmitting: boolean;
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      status,
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#0F2D29] p-6 text-white">
          <div className="flex items-center gap-3">
            <Pencil size={20} />
            <h2 className="text-[17px] font-bold font-['Goldman',sans-serif]">
              Edit Project
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
              className="w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none"
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
              className="w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full border border-[#0F2D29]/15 bg-white p-2.5 text-[13px] font-bold text-[#0F2D29] outline-none font-['Goldman',sans-serif] uppercase"
            >
              {(Object.keys(STATUS_META) as ProjectStatus[]).map((st) => (
                <option key={st} value={st}>
                  {STATUS_META[st].label}
                </option>
              ))}
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
                "Update Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
