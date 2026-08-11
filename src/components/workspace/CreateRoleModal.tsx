import { useState, type FormEvent } from "react";
import { Shield, X, Loader2, Check } from "lucide-react";
import { inputClass } from "./types";

const PERMISSION_GROUPS: {
  group: string;
  items: { key: string; label: string }[];
}[] = [
  {
    group: "Workspace",
    items: [
      { key: "workspace:view", label: "View Workspace" },
      { key: "workspace:update", label: "Update Workspace" },
      { key: "workspace:delete", label: "Delete Workspace" },
    ],
  },
  {
    group: "Projects",
    items: [
      { key: "project:create", label: "Create Projects" },
      { key: "project:view", label: "View Projects" },
      { key: "project:update", label: "Update Projects" },
      { key: "project:delete", label: "Delete Projects" },
    ],
  },
  {
    group: "Members",
    items: [
      { key: "member:add", label: "Add Members" },
      { key: "member:update", label: "Update Members" },
      { key: "member:remove", label: "Remove Members" },
    ],
  },
  {
    group: "Tasks",
    items: [
      { key: "task:create", label: "Create Tasks" },
      { key: "task:view", label: "View Tasks" },
      { key: "task:update", label: "Update Tasks" },
      { key: "task:delete", label: "Delete Tasks" },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) =>
  g.items.map((i) => i.key),
);

export const CreateRoleModal = ({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (name: string, description: string, permissions: string[]) => void;
  isSubmitting: boolean;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(["workspace:view", "project:view", "task:view"]),
  );

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedPermissions.size === ALL_PERMISSIONS.length) {
      setSelectedPermissions(new Set());
    } else {
      setSelectedPermissions(new Set(ALL_PERMISSIONS));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    onSubmit(name.trim(), description.trim(), Array.from(selectedPermissions));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg border border-[#0F2D29] bg-white shadow-2xl">
        <div className="bg-[#0F2D29] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={20} />
            <h2 className="text-[17px] font-bold font-['Goldman',sans-serif]">
              Create Custom Role
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

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Role Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lead QA Engineer"
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
              rows={2}
              placeholder="Role duties..."
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase">
                Permissions ({selectedPermissions.size})
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[11.5px] font-bold text-[#0F2D29] underline"
              >
                {selectedPermissions.size === ALL_PERMISSIONS.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="space-y-3 border border-[#0F2D29]/15 p-4 bg-[#0F2D29]/2 max-h-56 overflow-y-auto">
              {PERMISSION_GROUPS.map((g) => (
                <div key={g.group} className="space-y-1.5">
                  <p className="text-[11px] font-bold font-['Goldman',sans-serif] text-[#5B6E68] uppercase">
                    {g.group}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {g.items.map((i) => {
                      const checked = selectedPermissions.has(i.key);
                      return (
                        <button
                          key={i.key}
                          type="button"
                          onClick={() => togglePermission(i.key)}
                          className={`flex items-center gap-2 border p-2 text-left text-[11.5px] font-semibold transition ${
                            checked
                              ? "border-[#0F2D29] bg-[#0F2D29] text-white"
                              : "border-[#0F2D29]/15 bg-white text-[#5B6E68]"
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center border ${checked ? "border-white bg-white text-[#0F2D29]" : "border-[#0F2D29]/30"}`}
                          >
                            {checked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="truncate">{i.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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
                "Save Role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
