import { useState, type FormEvent } from "react";
import { Filter, UserPlus, Mail, Users, Trash2 } from "lucide-react";
import {
  type Member,
  type Role,
  ROLE_META,
  initials,
  formatDate,
  nextId,
  inputClass,
} from "./types";
import { PanelToolbar, PanelEmpty, NoResults } from "./SharedHelpers";

interface MembersPanelProps {
  members: Member[];
  canManage: boolean;
  onChange: (members: Member[]) => void;
  addActivity: (action: string, target: string, iconType: "member") => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
}

export const MembersPanel = ({
  members,
  canManage,
  onChange,
  addActivity,
  addToast,
}: MembersPanelProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const invite = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const newMember: Member = {
      userId: nextId("u"),
      name: email.split("@")[0] ?? "New Member",
      email: email.trim(),
      role,
      status: "invited",
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    onChange([...members, newMember]);
    addActivity("invited teammate", email.trim(), "member");
    addToast("success", `Invite sent to ${email.trim()}`);
    setEmail("");
    setRole("member");
  };

  const changeRole = (userId: string, newRole: Role, mEmail: string) => {
    onChange(
      members.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
    );
    addActivity(`changed role to ${newRole}`, mEmail, "member");
    addToast("info", `Updated role for ${mEmail}`);
  };

  const removeMember = (userId: string, mEmail: string) => {
    if (!confirm(`Remove ${mEmail} from this workspace?`)) return;
    onChange(members.filter((m) => m.userId !== userId));
    addActivity("removed member", mEmail, "member");
    addToast("warning", `Removed ${mEmail}`);
  };

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

        {/* Role filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter size={13} className="text-[#8FA69E]" />
          <span className="text-[12px] font-semibold text-[#5B6E68]">Filter:</span>
          {["all", "owner", "admin", "member"].map((rf) => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`rounded-lg px-2.5 py-1 text-[11.5px] font-semibold capitalize transition ${roleFilter === rf
                ? "bg-[#0F2D29] text-white"
                : "bg-[#0F2D29]/5 text-[#5B6E68] hover:bg-[#0F2D29]/10"
                }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* Invite form */}
      {canManage && (
        <form
          onSubmit={invite}
          className="mb-6 rounded-xl border border-[#0F2D29]/10 bg-gradient-to-r from-[#0F2D29]/3 to-transparent p-4 shadow-2xs"
        >
          <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-[#0F2D29]">
            <UserPlus size={15} className="text-[#0F8A65]" />
            Invite Teammate to Workspace
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Mail
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                type="email"
                className={`${inputClass} pl-9`}
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className={`${inputClass} w-full sm:w-36`}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={!email.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-medium text-white shadow-xs hover:bg-[#0F2D29]/90 disabled:opacity-40"
            >
              <UserPlus size={14} />
              Send Invite
            </button>
          </div>
        </form>
      )}

      {/* Members Grid */}
      {members.length === 0 ? (
        <PanelEmpty
          icon={Users}
          title="No teammates yet"
          hint="Invite teammates by email to collaborate on projects and assign tasks."
        />
      ) : filtered.length === 0 ? (
        <NoResults query={search} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((m) => {
            const RoleIcon = ROLE_META[m.role].icon;
            return (
              <article
                key={m.userId}
                className="group flex flex-col justify-between rounded-xl border border-[#0F2D29]/10 bg-white p-4 shadow-2xs transition hover:border-[#0F2D29]/20 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-[#0F2D29] ring-2 ring-[#8FE3C4]/40"
                        style={{ backgroundColor: "#8FE3C4" }}
                      >
                        {initials(m.name || m.email)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-[14px] font-bold text-[#0F2D29]">
                            {m.name}
                          </p>
                          {m.status === "invited" && (
                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-semibold text-amber-700 border border-amber-200">
                              Invited
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[12px] text-[#8FA69E]">
                          {m.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold ${ROLE_META[m.role].badge
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
                          changeRole(m.userId, e.target.value as Role, m.email)
                        }
                        className="rounded-lg border border-[#0F2D29]/10 bg-white px-2 py-1 text-[11.5px] font-medium text-[#0F2D29] outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => removeMember(m.userId, m.email)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        title="Remove member"
                      >
                        <Trash2 size={13} />
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
