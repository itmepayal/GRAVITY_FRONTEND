import { useMemo, useState, type FormEvent } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Eye,
  Plus,
  Loader2,
  Check,
  X,
  ChevronDown,
  Lock,
} from "lucide-react";
import { PanelEmpty } from "./SharedHelpers";
import { useGetWorkspaceRoles } from "@/hooks/queries/workspace/use-get-workspace-roles";
import { useCreateWorkspaceRole } from "@/hooks/mutations/workspace/use-create-workspace-role";

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
    group: "Boards",
    items: [
      { key: "board:create", label: "Create Boards" },
      { key: "board:view", label: "View Boards" },
      { key: "board:update", label: "Update Boards" },
      { key: "board:delete", label: "Delete Boards" },
    ],
  },
  {
    group: "Sprints",
    items: [
      { key: "sprint:create", label: "Create Sprints" },
      { key: "sprint:view", label: "View Sprints" },
      { key: "sprint:update", label: "Update Sprints" },
      { key: "sprint:delete", label: "Delete Sprints" },
    ],
  },
  {
    group: "Tasks",
    items: [
      { key: "task:create", label: "Create Tasks" },
      { key: "task:view", label: "View Tasks" },
      { key: "task:update", label: "Update Tasks" },
      { key: "task:delete", label: "Delete Tasks" },
      { key: "task:archive", label: "Archive Tasks" },
      { key: "task:assign", label: "Assign Tasks" },
      { key: "task:manage_comments", label: "Manage Task Comments" },
      { key: "task:watch", label: "Watch Tasks" },
      { key: "task:attachment", label: "Manage Task Attachments" },
      { key: "task:hours", label: "Log Task Hours" },
    ],
  },
  {
    group: "Teams",
    items: [
      { key: "team:create", label: "Create Teams" },
      { key: "team:view", label: "View Teams" },
      { key: "team:update", label: "Update Teams" },
      { key: "team:delete", label: "Delete Teams" },
      { key: "team:members:add", label: "Add Team Members" },
      { key: "team:members:remove", label: "Remove Team Members" },
      { key: "team:lead:change", label: "Change Team Lead" },
    ],
  },
];

const AVAILABLE_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.items);
const TOTAL_PERMISSIONS = AVAILABLE_PERMISSIONS.length;

const ROLE_TAG_META: Record<
  string,
  { icon: typeof Shield; badge: string; ring: string; dot: string }
> = {
  owner: {
    icon: Crown,
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    ring: "ring-amber-200/70",
    dot: "bg-amber-500",
  },
  admin: {
    icon: ShieldAlert,
    badge: "bg-[#3FA9F5]/12 text-[#1B79C4] ring-[#3FA9F5]/30",
    ring: "ring-[#3FA9F5]/25",
    dot: "bg-[#3FA9F5]",
  },
  member: {
    icon: ShieldCheck,
    badge: "bg-[#8FE3C4]/25 text-[#0F8A65] ring-[#8FE3C4]/50",
    ring: "ring-[#8FE3C4]/40",
    dot: "bg-[#0F8A65]",
  },
  viewer: {
    icon: Eye,
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    ring: "ring-slate-200",
    dot: "bg-slate-400",
  },
};

const DEFAULT_TAG_META = {
  icon: Shield,
  badge: "bg-[#C4B5FD]/20 text-[#7C3AED] ring-[#C4B5FD]/40",
  ring: "ring-[#C4B5FD]/30",
  dot: "bg-[#7C3AED]",
};

const getRoleTagMeta = (name: string) =>
  ROLE_TAG_META[name.trim().toLowerCase()] ?? DEFAULT_TAG_META;

interface WorkspaceRole {
  _id: string;
  name: string;
  permissions: string[];
  isSystem?: boolean;
  createdAt?: string;
}

interface RolesPanelProps {
  workspaceId: string;
  canManage: boolean;
  addActivity: (action: string, target: string, iconType: "role") => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
}

export const RolesPanel = ({
  workspaceId,
  canManage,
  addActivity,
  addToast,
}: RolesPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  const {
    data: rolesResponse,
    isLoading: isLoadingRoles,
    isError: isRolesError,
  } = useGetWorkspaceRoles(workspaceId);

  const { mutate: createRole, isPending: isCreating } =
    useCreateWorkspaceRole();

  const roles: WorkspaceRole[] = Array.isArray(rolesResponse)
    ? rolesResponse
    : (rolesResponse?.data ?? []);

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const toggleGroupPermissions = (
    groupItems: { key: string; label: string }[],
  ) => {
    const groupKeys = groupItems.map((i) => i.key);
    const allSelected = groupKeys.every((k) => selectedPermissions.includes(k));
    setSelectedPermissions((prev) =>
      allSelected
        ? prev.filter((k) => !groupKeys.includes(k))
        : Array.from(new Set([...prev, ...groupKeys])),
    );
  };

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const resetForm = () => {
    setName("");
    setSelectedPermissions([]);
    setCollapsedGroups(new Set());
    setShowForm(false);
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedPermissions.length === 0 || isCreating) return;

    createRole(
      {
        workspaceId,
        data: {
          name: name.trim(),
          permissions: selectedPermissions,
        },
      },
      {
        onSuccess: () => {
          addActivity("created a role", name.trim(), "role");
          addToast("success", `Role "${name.trim()}" created.`);
          resetForm();
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || "Failed to create role.";
          addToast("warning", message);
        },
      },
    );
  };

  const sortedRoles = useMemo(() => {
    const priority = ["owner", "admin", "member", "viewer"];
    return [...roles].sort((a, b) => {
      const ai = priority.indexOf(a.name.trim().toLowerCase());
      const bi = priority.indexOf(b.name.trim().toLowerCase());
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      }
      return a.name.localeCompare(b.name);
    });
  }, [roles]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[13.5px] font-bold text-[#0F2D29]">Custom Roles</p>
          <p className="text-[12px] text-[#8FA69E]">
            {roles.length} role{roles.length === 1 ? "" : "s"} defined for this
            workspace
          </p>
        </div>

        {canManage && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-2 text-[12.5px] font-medium text-white shadow-xs transition hover:bg-[#0F2D29]/90"
          >
            <Plus size={14} />
            New Role
          </button>
        )}
      </div>

      {canManage && showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#0F2D29]/8 bg-linear-to-r from-[#8FE3C4]/10 to-transparent px-4 py-3.5">
            <p className="flex items-center gap-2 text-[13.5px] font-bold text-[#0F2D29]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C4B5FD]/20 text-[#7C3AED]">
                <Shield size={14} />
              </span>
              Create Custom Role
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-1.5 text-[#8FA69E] transition hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
            >
              <X size={14} />
            </button>
          </div>

          <div className="p-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Role name (e.g. Content Editor)"
              disabled={isCreating}
              className="mb-4 w-full rounded-xl border border-[#0F2D29]/10 bg-white px-3.5 py-2.5 text-[13px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E] focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20 disabled:opacity-50"
            />

            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11.5px] font-semibold text-[#5B6E68]">
                Permissions
              </p>
              <span className="rounded-full bg-[#0F2D29]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#5B6E68] tabular-nums">
                {selectedPermissions.length} / {TOTAL_PERMISSIONS} selected
              </span>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-[#0F2D29]/8 bg-[#0F2D29]/1.5 p-2.5 pr-1.5">
              {PERMISSION_GROUPS.map(({ group, items }) => {
                const groupKeys = items.map((i) => i.key);
                const selectedCount = groupKeys.filter((k) =>
                  selectedPermissions.includes(k),
                ).length;
                const allSelected = selectedCount === groupKeys.length;
                const isCollapsed = collapsedGroups.has(group);

                return (
                  <div
                    key={group}
                    className="overflow-hidden rounded-lg border border-[#0F2D29]/8 bg-white"
                  >
                    <div className="flex items-center justify-between px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleGroupCollapse(group)}
                        className="flex flex-1 items-center gap-1.5 text-left"
                      >
                        <ChevronDown
                          size={13}
                          className={`shrink-0 text-[#8FA69E] transition-transform ${
                            isCollapsed ? "-rotate-90" : ""
                          }`}
                        />
                        <span className="text-[11.5px] font-bold tracking-wide text-[#0F2D29] uppercase">
                          {group}
                        </span>
                        <span className="text-[10.5px] font-medium text-[#8FA69E] tabular-nums">
                          ({selectedCount}/{groupKeys.length})
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={isCreating}
                        onClick={() => toggleGroupPermissions(items)}
                        className="shrink-0 text-[10.5px] font-semibold text-[#0F8A65] hover:underline disabled:opacity-50"
                      >
                        {allSelected ? "Clear" : "Select all"}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <div className="grid grid-cols-1 gap-1.5 border-t border-[#0F2D29]/6 p-2.5 sm:grid-cols-2">
                        {items.map((perm) => {
                          const isChecked = selectedPermissions.includes(
                            perm.key,
                          );
                          return (
                            <button
                              key={perm.key}
                              type="button"
                              disabled={isCreating}
                              onClick={() => togglePermission(perm.key)}
                              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[11.5px] font-medium transition disabled:opacity-50 ${
                                isChecked
                                  ? "border-[#0F8A65]/40 bg-[#8FE3C4]/15 text-[#0F2D29]"
                                  : "border-[#0F2D29]/8 bg-white text-[#5B6E68] hover:bg-[#0F2D29]/4"
                              }`}
                            >
                              <span
                                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded transition ${
                                  isChecked
                                    ? "bg-[#0F8A65] text-white"
                                    : "border border-[#0F2D29]/20"
                                }`}
                              >
                                {isChecked && <Check size={10} />}
                              </span>
                              <span className="truncate">{perm.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="submit"
                disabled={
                  !name.trim() || selectedPermissions.length === 0 || isCreating
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-medium text-white shadow-xs transition hover:bg-[#0F2D29]/90 disabled:opacity-40"
              >
                {isCreating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Shield size={14} />
                )}
                {isCreating ? "Creating..." : "Create Role"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isCreating}
                className="rounded-xl border border-[#0F2D29]/10 px-4 py-2 text-[12.5px] font-medium text-[#5B6E68] transition hover:bg-[#0F2D29]/5 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoadingRoles ? (
        <div className="flex flex-col items-center justify-center gap-2 py-14">
          <Loader2 size={20} className="animate-spin text-[#0F8A65]" />
          <p className="text-[12px] text-[#5B6E68]">Loading roles...</p>
        </div>
      ) : isRolesError ? (
        <div className="flex flex-col items-center gap-2 py-14 text-center">
          <p className="text-[12.5px] font-medium text-[#0F2D29]">
            Couldn't load roles
          </p>
          <p className="text-[11px] text-[#8FA69E]">
            Please refresh the page to try again.
          </p>
        </div>
      ) : roles.length === 0 ? (
        <PanelEmpty
          icon={Shield}
          title="No custom roles yet"
          hint="Create custom roles to fine-tune what teammates can do in this workspace."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sortedRoles.map((role) => {
            const meta = getRoleTagMeta(role.name);
            const RoleIcon = meta.icon;
            const isExpanded = expandedRoleId === role._id;
            const visiblePerms = isExpanded
              ? role.permissions
              : role.permissions.slice(0, 6);
            const hiddenCount = role.permissions.length - visiblePerms.length;

            return (
              <article
                key={role._id}
                className={`rounded-xl border border-[#0F2D29]/10 bg-white p-4 shadow-2xs ring-1 ring-transparent transition hover:border-[#0F2D29]/20 hover:shadow-xs ${meta.ring}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.badge}`}
                    >
                      <RoleIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[#0F2D29]">
                        {role.name}
                      </p>
                      <p className="text-[11px] text-[#8FA69E] tabular-nums">
                        {role.permissions.length} permission
                        {role.permissions.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ring-1 ring-inset ${meta.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {role.isSystem ? role.name : "Custom"}
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                  {visiblePerms.map((perm) => {
                    const label =
                      AVAILABLE_PERMISSIONS.find((p) => p.key === perm)
                        ?.label ?? perm;
                    return (
                      <span
                        key={perm}
                        className="rounded-full bg-[#0F2D29]/5 px-2 py-0.5 text-[10.5px] font-medium text-[#5B6E68]"
                      >
                        {label}
                      </span>
                    );
                  })}

                  {hiddenCount > 0 && !isExpanded && (
                    <button
                      onClick={() => setExpandedRoleId(role._id)}
                      className="rounded-full bg-[#0F2D29]/8 px-2 py-0.5 text-[10.5px] font-semibold text-[#0F2D29] hover:bg-[#0F2D29]/12"
                    >
                      +{hiddenCount} more
                    </button>
                  )}

                  {isExpanded && role.permissions.length > 6 && (
                    <button
                      onClick={() => setExpandedRoleId(null)}
                      className="rounded-full bg-[#0F2D29]/8 px-2 py-0.5 text-[10.5px] font-semibold text-[#0F2D29] hover:bg-[#0F2D29]/12"
                    >
                      Show less
                    </button>
                  )}
                </div>

                {role.isSystem && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-[#0F2D29]/6 pt-2.5 text-[10.5px] text-[#8FA69E]">
                    <Lock size={11} />
                    Built-in role — permissions can't be edited
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
