import { useState, useRef, useEffect, type FormEvent } from "react";
import { UserPlus, ChevronDown, Search, Loader2, X } from "lucide-react";
import { type Role, ROLE_META, initials, inputClass } from "./types";

export interface UserOption {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export const Avatar = ({
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
        className={`${cls} shrink-0 border border-[#0F2D29]/20 object-cover ${
          ring ? "ring-2 ring-[#8FE3C4]/40" : ""
        }`}
      />
    );
  }
  return (
    <div
      className={`flex ${cls} shrink-0 items-center justify-center font-extrabold text-[#0F2D29] ${
        ring ? "ring-2 ring-[#8FE3C4]/40" : ""
      }`}
      style={{ backgroundColor: "#8FE3C4", fontSize: textSize }}
    >
      {initials(name)}
    </div>
  );
};

export const UserSelect = ({
  users,
  value,
  onChange,
  disabled = false,
  loading = false,
}: {
  users: UserOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = users.find((u) => u.id === value);
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        disabled={disabled || loading || users.length === 0}
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex w-full items-center justify-between gap-2 text-left font-semibold`}
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
            className={`truncate text-[13px] ${selected ? "font-semibold text-[#0F2D29]" : "text-[#8FA69E]"}`}
          >
            {selected
              ? `${selected.name} (${selected.email})`
              : "Select a user…"}
          </span>
        </span>
        <ChevronDown size={14} className="text-[#8FA69E]" />
      </button>

      {open && !loading && (
        <div className="absolute z-20 mt-1 w-full border border-[#0F2D29] bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-[#0F2D29]/10 px-3 py-2">
            <Search size={13} className="text-[#8FA69E]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search user..."
              className="w-full text-[13px] font-semibold text-[#0F2D29] outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onChange(u.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#0F2D29]/5"
              >
                <Avatar name={u.name} src={u.avatar} size={6} textSize="9px" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-[#0F2D29] truncate">
                    {u.name}
                  </p>
                  <p className="text-[11px] font-medium text-[#5B6E68] truncate">
                    {u.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const AddMemberModal = ({
  users,
  isLoadingUsers,
  existingMemberUserIds,
  onClose,
  onAdd,
  isAdding,
}: {
  users: UserOption[];
  isLoadingUsers?: boolean;
  existingMemberUserIds: Set<string>;
  onClose: () => void;
  onAdd: (userId: string, role: Role) => void;
  isAdding: boolean;
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState<Role>("member");

  const availableUsers = users.filter((u) => !existingMemberUserIds.has(u.id));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || isAdding) return;
    onAdd(selectedUserId, role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl">
        <div className="bg-[#0F2D29] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus size={20} />
            <h2 className="text-[17px] font-bold font-['Goldman',sans-serif]">
              Add Teammate
            </h2>
          </div>
          <button onClick={onClose} className="text-[#B7CFC7] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Select User
            </label>
            <UserSelect
              users={availableUsers}
              value={selectedUserId}
              onChange={setSelectedUserId}
              loading={isLoadingUsers}
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase mb-1">
              Assigned Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={inputClass}
            >
              {(["admin", "member", "viewer"] as Role[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_META[r]?.label ?? r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-bold text-[#5B6E68]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedUserId || isAdding}
              className="bg-[#0F2D29] text-white px-5 py-2 text-[13px] font-bold font-['Goldman',sans-serif]"
            >
              {isAdding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Add Teammate"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
