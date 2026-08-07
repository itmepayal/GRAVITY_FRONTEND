import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  Filter,
  UserPlus,
  Users,
  Trash2,
  Loader2,
  ChevronDown,
  Search,
  Check,
} from "lucide-react";
import {
  type Member,
  type Role,
  ROLE_META,
  initials,
  formatDate,
  inputClass,
} from "./types";
import { PanelToolbar, PanelEmpty, NoResults } from "./SharedHelpers";

interface UserOption {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface MembersPanelProps {
  members: Member[];
  canManage: boolean;
  onChange: (members: Member[]) => void;
  onAddMember: (memberData: { userId: string; role: string }) => void;
  isAddingMember?: boolean;
  onRemoveMember: (memberId: string, memberLabel: string) => void;
  isRemovingMember?: boolean;
  users: UserOption[];
  isLoadingUsers?: boolean;
  addActivity: (action: string, target: string, iconType: "member") => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
}

interface UserSelectProps {
  users: UserOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const UserSelect = ({
  users,
  value,
  onChange,
  disabled = false,
  loading = false,
}: UserSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = users.find((u) => u.id === value) || null;

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const label = loading
    ? "Loading users..."
    : selected
      ? selected.name
      : users.length === 0
        ? "No users available to add"
        : "Select a user";

  const emptyState = loading
    ? "Loading users..."
    : users.length === 0
      ? "Everyone is already a member"
      : "No matches";

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        disabled={disabled || loading || users.length === 0}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            selected.avatar ? (
              <img
                src={selected.avatar}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-[#0F2D29]"
                style={{ backgroundColor: "#8FE3C4" }}
              >
                {initials(selected.name)}
              </span>
            )
          ) : null}
          <span
            className={`truncate text-[13px] ${
              selected ? "font-medium text-[#0F2D29]" : "text-[#8FA69E]"
            }`}
          >
            {label}
          </span>
        </span>
        {loading ? (
          <Loader2 size={14} className="shrink-0 animate-spin text-[#8FA69E]" />
        ) : (
          <ChevronDown
            size={14}
            className={`shrink-0 text-[#8FA69E] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && !loading && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-[#0F2D29]/10 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-[#0F2D29]/8 px-3 py-2">
            <Search size={13} className="shrink-0 text-[#8FA69E]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E]"
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-[12px] text-[#8FA69E]">
                {emptyState}
              </p>
            ) : (
              filtered.map((u) => {
                const isSelected = u.id === value;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      onChange(u.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition ${
                      isSelected ? "bg-[#0F2D29]/5" : "hover:bg-[#0F2D29]/5"
                    }`}
                  >
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-[#0F2D29]"
                        style={{ backgroundColor: "#8FE3C4" }}
                      >
                        {initials(u.name)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-[#0F2D29]">
                        {u.name}
                      </span>
                      <span className="block truncate text-[11px] text-[#8FA69E]">
                        {u.email}
                      </span>
                    </span>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-[#0F8A65]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const MembersPanel = ({
  members,
  canManage,
  onChange,
  onAddMember,
  isAddingMember = false,
  onRemoveMember,
  isRemovingMember = false,
  users,
  isLoadingUsers = false,
  addActivity,
  addToast,
}: MembersPanelProps) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const memberIds = new Set(members.map((m) => m.user?.id));
  const availableUsers = (users || []).filter((u) => !memberIds.has(u.id));

  const filtered = members.filter((m) => {
    const name = m.user?.name ?? "";
    const mEmail = m.user?.email ?? "";
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      mEmail.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const invite = (e: FormEvent) => {
    e.preventDefault();
    if (!userId || isAddingMember) return;
    onAddMember({ userId, role });
    setUserId("");
    setRole("member");
  };

  const changeRole = (memberId: string, newRole: Role, mEmail: string) => {
    onChange(
      members.map((m) => (m._id === memberId ? { ...m, role: newRole } : m)),
    );
    addActivity(`changed role to ${newRole}`, mEmail, "member");
    addToast("info", `Updated role for ${mEmail}`);
  };

  const removeMember = (memberId: string, mEmail: string) => {
    if (!confirm(`Remove ${mEmail} from this workspace?`)) return;
    setRemovingMemberId(memberId);
    onRemoveMember(memberId, mEmail);
  };

  useEffect(() => {
    if (!isRemovingMember) setRemovingMemberId(null);
  }, [isRemovingMember]);

  console.log(members);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PanelToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search teammates by name or email..."
          count={filtered.length}
          total={members.length}
        />

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter size={13} className="text-[#8FA69E]" />
          <span className="text-[12px] font-semibold text-[#5B6E68]">
            Filter:
          </span>
          {["all", "owner", "admin", "member"].map((rf) => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`rounded-lg px-2.5 py-1 text-[11.5px] font-semibold capitalize transition ${
                roleFilter === rf
                  ? "bg-[#0F2D29] text-white"
                  : "bg-[#0F2D29]/5 text-[#5B6E68] hover:bg-[#0F2D29]/10"
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {canManage && (
        <form
          onSubmit={invite}
          className="mb-6 rounded-xl border border-[#0F2D29]/10 bg-linear-to-r from-[#0F2D29]/3 to-transparent p-4 shadow-2xs"
        >
          <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[#0F2D29]">
            <UserPlus size={15} className="text-[#0F8A65]" />
            Add Teammate to Workspace
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <UserSelect
              users={availableUsers}
              value={userId}
              onChange={setUserId}
              disabled={isAddingMember}
              loading={isLoadingUsers}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={isAddingMember}
              className={`${inputClass} w-full sm:w-36 disabled:opacity-50`}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={!userId || isAddingMember}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-medium text-white shadow-xs hover:bg-[#0F2D29]/90 disabled:opacity-40"
            >
              {isAddingMember ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              {isAddingMember ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      )}

      {members.length === 0 ? (
        <PanelEmpty
          icon={Users}
          title="No teammates yet"
          hint="Add teammates by user ID to collaborate on projects and assign tasks."
        />
      ) : filtered.length === 0 ? (
        <NoResults query={search} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((m) => {
            const RoleIcon = ROLE_META[m.role].icon;
            const displayName = m.user?.name || m.user?.email || "Unknown";
            const displayEmail = m.user?.email || "";
            const isRemovingThis =
              isRemovingMember && removingMemberId === m._id;
            return (
              <article
                key={m._id}
                className="group flex flex-col justify-between rounded-xl border border-[#0F2D29]/10 bg-white p-4 shadow-2xs transition hover:border-[#0F2D29]/20 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {m.user?.avatar ? (
                        <img
                          src={m.user.avatar}
                          alt={displayName}
                          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#8FE3C4]/40"
                        />
                      ) : (
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-[#0F2D29] ring-2 ring-[#8FE3C4]/40"
                          style={{ backgroundColor: "#8FE3C4" }}
                        >
                          {initials(displayName)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-[14px] font-bold text-[#0F2D29]">
                            {displayName}
                          </p>
                        </div>
                        <p className="truncate text-[12px] text-[#8FA69E]">
                          {displayEmail || "No email on file"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${
                        ROLE_META[m.role].badge
                      }`}
                    >
                      <RoleIcon size={10} />
                      {m.role}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#0F2D29]/6 pt-3">
                  <span className="text-[11px] text-[#8FA69E]">
                    Joined {formatDate(m.joinedAt)}
                  </span>

                  {canManage && m.role !== "owner" && (
                    <div className="flex items-center gap-2">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          changeRole(
                            m._id,
                            e.target.value as Role,
                            displayEmail,
                          )
                        }
                        disabled={isRemovingThis}
                        className="rounded-lg border border-[#0F2D29]/10 bg-white px-2 py-1 text-[11.5px] font-medium text-[#0F2D29] outline-none disabled:opacity-50"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => removeMember(m._id, displayEmail)}
                        disabled={isRemovingThis}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Remove member"
                      >
                        {isRemovingThis ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
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
