import { useState, type FormEvent } from "react";
import { Plus, Shield, X, KeyRound, Trash2, Hash } from "lucide-react";
import {
  type WorkspaceRole,
  PERMISSION_GROUPS,
  nextId,
  groupPermissions,
  inputClass,
} from "./types";
import { SharedHelpers } from "./SharedHelpers";

const { PanelToolbar, Field, PanelEmpty, NoResults } = SharedHelpers;

interface RolesPanelProps {
  roles: WorkspaceRole[];
  canManage: boolean;
  onChange: (roles: WorkspaceRole[]) => void;
  addActivity: (action: string, target: string, iconType: "role") => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
}

export const RolesPanel = ({
  roles,
  canManage,
  onChange,
  addActivity,
  addToast,
}: RolesPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filtered = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const togglePerm = (permId: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId]
    );
  };

  const toggleCategory = (permIds: string[]) => {
    const allSelected = permIds.every((id) => selectedPerms.includes(id));
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((id) => !permIds.includes(id)));
    } else {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...permIds])));
    }
  };

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newRole: WorkspaceRole = {
      _id: nextId("r"),
      name: name.trim(),
      permissions: selectedPerms,
    };
    onChange([...roles, newRole]);
    addActivity("created custom role", name.trim(), "role");
    addToast("success", `Custom role "${name.trim()}" created.`);
    setName("");
    setSelectedPerms([]);
    setShowForm(false);
  };

  const deleteRole = (roleId: string, rName: string) => {
    if (!confirm(`Delete role "${rName}"?`)) return;
    onChange(roles.filter((r) => r._id !== roleId));
    addActivity("deleted role", rName, "role");
    addToast("info", `Deleted role "${rName}".`);
  };

  return (
    <div>
      <PanelToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search custom roles..."
        count={filtered.length}
        total={roles.length}
        action={
          canManage &&
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-xs hover:bg-[#0F2D29]/90"
            >
              <Plus size={14} />
              Create Custom Role
            </button>
          )
        }
      />

      {/* Role Creation Grid */}
      {canManage && showForm && (
        <form
          onSubmit={create}
          className="mb-6 space-y-4 rounded-xl border border-[#3FA9F5]/30 bg-gradient-to-br from-[#3FA9F5]/5 to-transparent p-5 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-[#3FA9F5]/15 pb-3">
            <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#1B79C4]">
              <Shield size={16} />
              Define Custom Role & Permissions
            </p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[#8FA69E] hover:text-[#0F2D29]"
            >
              <X size={16} />
            </button>
          </div>

          <Field label="Role Name" htmlFor="role-name-input">
            <input
              id="role-name-input"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lead QA Engineer, Finance Auditor"
              className={inputClass}
            />
          </Field>

          <div>
            <label className="mb-2.5 block text-[12.5px] font-bold text-[#0F2D29]">
              Select Granted Permissions ({selectedPerms.length} selected)
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              {PERMISSION_GROUPS.map((grp) => {
                const groupIds = grp.permissions.map((p) => p.id);
                const isAllSelected = groupIds.every((id) =>
                  selectedPerms.includes(id)
                );
                return (
                  <div
                    key={grp.category}
                    className="rounded-xl border border-[#0F2D29]/10 bg-white p-3.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-[#0F2D29]/6 pb-2">
                      <span className="text-[12px] font-bold text-[#0F2D29]">
                        {grp.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCategory(groupIds)}
                        className="text-[10.5px] font-semibold text-[#0F8A65] hover:underline"
                      >
                        {isAllSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    <div className="mt-2.5 space-y-2">
                      {grp.permissions.map((p) => {
                        const active = selectedPerms.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex items-start gap-2.5 cursor-pointer rounded-lg p-1.5 hover:bg-[#0F2D29]/3 transition"
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => togglePerm(p.id)}
                              className="mt-0.5 h-4 w-4 accent-[#0F2D29] rounded"
                            />
                            <div>
                              <p className="text-[12px] font-semibold text-[#0F2D29]">
                                {p.name}
                              </p>
                              <p className="text-[10.5px] text-[#8FA69E]">
                                {p.desc}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#0F2D29]/8">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl px-4 py-2 text-[13px] text-[#5B6E68]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || selectedPerms.length === 0}
              className="rounded-xl bg-[#0F2D29] px-5 py-2 text-[13px] font-medium text-white shadow-xs disabled:opacity-40"
            >
              Save Custom Role
            </button>
          </div>
        </form>
      )}

      {/* Roles Display */}
      {roles.length === 0 ? (
        <PanelEmpty
          icon={Shield}
          title="No custom roles defined"
          hint="Define custom roles with fine-grained permission capabilities tailored to your workflow."
        />
      ) : filtered.length === 0 ? (
        <NoResults query={search} />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const groups = groupPermissions(r.permissions);
            return (
              <article
                key={r._id}
                className="overflow-hidden rounded-xl border border-[#0F2D29]/10 bg-white shadow-2xs transition hover:shadow-xs"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#0F2D29]/8 bg-[#0F2D29]/3 px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3FA9F5]/15 text-[#1B79C4]">
                      <KeyRound size={16} />
                    </div>
                    <div>
                      <h4 className="text-[14.5px] font-bold text-[#0F2D29]">
                        {r.name}
                      </h4>
                      <p className="text-[11px] text-[#8FA69E]">
                        {r.permissions.length} total granted permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#0F2D29]/6 px-2.5 py-0.5 font-mono text-[10.5px] font-medium text-[#5B6E68]">
                      custom
                    </span>
                    {canManage && (
                      <button
                        onClick={() => deleteRole(r._id, r.name)}
                        className="rounded-lg p-1.5 text-[#8FA69E] hover:text-red-500"
                        title="Delete role"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {groups.length === 0 ? (
                    <p className="text-[12px] italic text-[#8FA69E]">
                      No permissions assigned.
                    </p>
                  ) : (
                    groups.map(([ns, perms]) => (
                      <div key={ns}>
                        <p className="mb-1.5 flex items-center gap-1 text-[10.5px] font-bold tracking-wider text-[#8FA69E] uppercase">
                          <Hash size={11} />
                          {ns}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {perms.map((p) => (
                            <span
                              key={p}
                              className="rounded-md border border-[#0F2D29]/10 bg-[#0F2D29]/3 px-2 py-1 font-mono text-[11px] font-medium text-[#0F2D29]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
