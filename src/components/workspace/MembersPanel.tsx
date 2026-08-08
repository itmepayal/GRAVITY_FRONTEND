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
import { DeleteMemberModal } from "./DeleteMemberModal";

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
  onUpdateMemberRole: (
    memberId: string,
    newRole: string,
    memberLabel: string,
  ) => void;
  isUpdatingMemberRole?: boolean;
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

const Avatar = ({
  name,
  src,
  size = 11,
  textSize = "13px",
  ring = false,
}: {
  name: string;
  src?: string | null;
  size?: number;
  textSize?: string;
  ring?: boolean;
}) => {
  const cls = `h-${size} w-${size}`;
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${cls} shrink-0 rounded-full object-cover ${
          ring ? "ring-2 ring-[#8FE3C4]/40" : ""
        }`}
      />
    );
  }
  return (
    <div
      className={`flex ${cls} shrink-0 items-center justify-center rounded-full font-extrabold text-[#0F2D29] ${
        ring ? "ring-2 ring-[#8FE3C4]/40" : ""
      }`}
      style={{ backgroundColor: "#8FE3C4", fontSize: textSize }}
    >
      {initials(name)}
    </div>
  );
};

const UserSelect = ({
  users,
  value,
  onChange,
  disabled = false,
  loading = false,
}: UserSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const commit = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIndex];
      if (target) commit(target.id);
    }
  };

  const label = loading
    ? "Loading teammates…"
    : selected
      ? selected.name
      : users.length === 0
        ? "Everyone is already a member"
        : "Choose a teammate";

  const emptyState = loading
    ? "Loading teammates…"
    : users.length === 0
      ? "Everyone is already a member"
      : `No one matches "${query}"`;

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        disabled={disabled || loading || users.length === 0}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${inputClass} flex w-full items-center justify-between gap-2 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? "ring-2 ring-[#0F8A65]/30" : ""
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected && (
            <Avatar
              name={selected.name}
              src={selected.avatar}
              size={5}
              textSize="9px"
            />
          )}
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
            className={`shrink-0 text-[#8FA69E] transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {open && !loading && (
        <div
          className="absolute z-20 mt-1.5 w-full origin-top animate-[fadeIn_120ms_ease-out] overflow-hidden rounded-xl border border-[#0F2D29]/10 bg-white shadow-lg"
          role="listbox"
        >
          <div className="flex items-center gap-2 border-b border-[#0F2D29]/8 px-3 py-2">
            <Search size={13} className="shrink-0 text-[#8FA69E]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or email…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E]"
            />
            {query && (
              <span className="shrink-0 text-[10.5px] font-medium text-[#8FA69E]">
                {filtered.length}
              </span>
            )}
          </div>

          <div ref={listRef} className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-[12px] text-[#8FA69E]">
                {emptyState}
              </p>
            ) : (
              filtered.map((u, i) => {
                const isSelected = u.id === value;
                const isActive = i === activeIndex;
                return (
                  <button
                    key={u.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => commit(u.id)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition ${
                      isSelected
                        ? "bg-[#0F8A65]/8"
                        : isActive
                          ? "bg-[#0F2D29]/5"
                          : ""
                    }`}
                  >
                    <Avatar
                      name={u.name}
                      src={u.avatar}
                      size={7}
                      textSize="10px"
                    />
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
  // onChange,
  onAddMember,
  isAddingMember = false,
  onRemoveMember,
  isRemovingMember = false,
  onUpdateMemberRole,
  isUpdatingMemberRole = false,
  users,
  isLoadingUsers = false,
  // addActivity,
  // addToast,
}: MembersPanelProps) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

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

  const roleCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  const invite = (e: FormEvent) => {
    e.preventDefault();
    if (!userId || isAddingMember) return;
    onAddMember({ userId, role });
    setUserId("");
    setRole("member");
  };

  // memberId here is the user's id (m.user.id), NOT the member subdocument's _id.
  const changeRole = (memberId: string, newRole: Role, mEmail: string) => {
    setUpdatingRoleId(memberId);
    onUpdateMemberRole(memberId, newRole, mEmail);
  };

  // Opens the confirm modal instead of removing immediately.
  const requestRemove = (member: Member) => {
    setMemberToDelete(member);
  };

  // Called only after the modal confirms the typed email matches.
  const confirmRemove = () => {
    if (!memberToDelete) return;
    const mEmail = memberToDelete.user?.email || "";
    setRemovingMemberId(memberToDelete.user.id);
    onRemoveMember(memberToDelete.user.id, mEmail);
  };

  useEffect(() => {
    if (!isRemovingMember) {
      setRemovingMemberId(null);
      setMemberToDelete(null);
    }
  }, [isRemovingMember]);

  useEffect(() => {
    if (!isUpdatingMemberRole) setUpdatingRoleId(null);
  }, [isUpdatingMemberRole]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PanelToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search teammates by name or email…"
          count={filtered.length}
          total={members.length}
        />

        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <Filter size={13} className="text-[#8FA69E]" />
          {["all", "owner", "admin", "member"].map((rf) => {
            const count = rf === "all" ? members.length : roleCounts[rf] || 0;
            const isActive = roleFilter === rf;
            return (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold capitalize transition ${
                  isActive
                    ? "bg-[#0F2D29] text-white"
                    : "bg-[#0F2D29]/5 text-[#5B6E68] hover:bg-[#0F2D29]/10"
                }`}
              >
                {rf}
                <span
                  className={`text-[10px] font-bold ${
                    isActive ? "text-white/60" : "text-[#8FA69E]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {canManage && (
        <form
          onSubmit={invite}
          className="mb-6 rounded-xl border border-[#0F2D29]/10 bg-linear-to-r from-[#0F2D29]/4 to-transparent p-4 shadow-2xs"
        >
          <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[#0F2D29]">
            <UserPlus size={15} className="text-[#0F8A65]" />
            Add teammate to workspace
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
              aria-label="Role for new member"
              className={`${inputClass} w-full sm:w-36 disabled:opacity-50`}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={!userId || isAddingMember}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-medium text-white shadow-xs transition hover:bg-[#0F2D29]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F8A65] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isAddingMember ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <UserPlus size={14} />
              )}
              {isAddingMember ? "Adding…" : "Add member"}
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
              isRemovingMember && removingMemberId === m.user.id;
            const isUpdatingThis =
              isUpdatingMemberRole && updatingRoleId === m.user.id;
            const isBusy = isRemovingThis || isUpdatingThis;

            return (
              <article
                key={m._id}
                className={`group flex flex-col justify-between rounded-xl border border-[#0F2D29]/10 bg-white p-4 shadow-2xs transition duration-150 hover:-translate-y-0.5 hover:border-[#0F2D29]/20 hover:shadow-md ${
                  isBusy ? "opacity-70" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        name={displayName}
                        src={m.user?.avatar}
                        size={11}
                        textSize="13px"
                        ring
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-[#0F2D29]">
                          {displayName}
                        </p>
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
                            m.user.id,
                            e.target.value as Role,
                            displayEmail,
                          )
                        }
                        disabled={isBusy}
                        aria-label={`Change role for ${displayName}`}
                        className="rounded-lg border border-[#0F2D29]/10 bg-white px-2 py-1 text-[11.5px] font-medium text-[#0F2D29] outline-none transition focus-visible:ring-2 focus-visible:ring-[#0F8A65]/30 disabled:opacity-50"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>

                      {isUpdatingThis && (
                        <Loader2
                          size={13}
                          className="shrink-0 animate-spin text-[#0F8A65]"
                        />
                      )}

                      <button
                        onClick={() => requestRemove(m)}
                        disabled={isBusy}
                        aria-label={`Remove ${displayName}`}
                        title="Remove member"
                        className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-50"
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

      {memberToDelete && (
        <DeleteMemberModal
          memberName={
            memberToDelete.user?.name ||
            memberToDelete.user?.email ||
            "this teammate"
          }
          memberEmail={memberToDelete.user?.email || ""}
          isRemoving={
            isRemovingMember && removingMemberId === memberToDelete.user.id
          }
          onClose={() => setMemberToDelete(null)}
          onConfirm={confirmRemove}
        />
      )}
    </div>
  );
};
