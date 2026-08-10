import { useState, useMemo } from "react";
import { Filter, UserPlus, Trash2 } from "lucide-react";
import {
  type Member,
  type Role,
  ROLE_META,
  formatDate,
} from "./types";
import { PanelToolbar, PanelEmpty, NoResults } from "./SharedHelpers";
import { DeleteMemberModal } from "./DeleteMemberModal";
import { AddMemberModal, Avatar, type UserOption } from "./AddMemberModal";

interface MembersPanelProps {
  members: Member[];
  canManage: boolean;
  onChange?: (members: Member[]) => void;
  onAddMember: (memberData: { userId: string; role: string }) => void;
  isAddingMember?: boolean;
  onRemoveMember: (memberId: string, memberLabel: string) => void;
  isRemovingMember?: boolean;
  onUpdateMemberRole: (
    memberId: string,
    newRole: string,
    memberLabel: string
  ) => void;
  isUpdatingMemberRole?: boolean;
  users: UserOption[];
  isLoadingUsers?: boolean;
  addActivity: (action: string, target: string, iconType: "member") => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
}

export const MembersPanel = ({
  members,
  canManage,
  onAddMember,
  isAddingMember = false,
  onRemoveMember,
  isRemovingMember = false,
  onUpdateMemberRole,
  isUpdatingMemberRole = false,
  users,
  isLoadingUsers = false,
}: MembersPanelProps) => {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  const existingUserIds = useMemo(
    () => new Set(members.map((m) => m.user.id)),
    [members]
  );

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchQuery =
        m.user.name.toLowerCase().includes(query.toLowerCase()) ||
        m.user.email.toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === "all" || m.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [members, query, roleFilter]);

  const handleAddSubmit = (userId: string, role: Role) => {
    onAddMember({ userId, role });
    setShowAddModal(false);
  };

  const handleRoleChange = (member: Member, newRole: Role) => {
    if (member.role === newRole) return;
    onUpdateMemberRole(member.user.id, newRole, member.user.name);
  };

  return (
    <div className="space-y-4">
      <PanelToolbar
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Filter members by name or email…"
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 bg-[#0F2D29] px-3.5 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
            >
              <UserPlus size={14} strokeWidth={2.5} />
              Add Teammate
            </button>
          ) : undefined
        }
      >
        <div className="flex items-center gap-1.5 border border-[#0F2D29]/15 bg-white px-2.5 py-1 text-[12px] font-semibold text-[#5B6E68]">
          <Filter size={13} className="text-[#0F2D29]" />
          <span>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
            className="bg-transparent font-bold text-[#0F2D29] outline-none"
          >
            <option value="all">All ({members.length})</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </PanelToolbar>

      {members.length === 0 ? (
        <PanelEmpty
          title="No teammates in workspace"
          description="Add members to start collaborating."
        />
      ) : filtered.length === 0 ? (
        <NoResults />
      ) : (
        <div className="overflow-x-auto border border-[#0F2D29]/12 bg-white shadow-2xs">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[#0F2D29]/10 bg-[#0F2D29]/5 text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">
              <tr>
                <th className="py-3 px-4 font-['Goldman',sans-serif]">Member</th>
                <th className="py-3 px-4 font-['Goldman',sans-serif]">Role</th>
                <th className="py-3 px-4 font-['Goldman',sans-serif]">Joined</th>
                {canManage && <th className="py-3 px-4 text-right font-['Goldman',sans-serif]">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F2D29]/8">
              {filtered.map((m) => {
                const isOwner = m.role === "owner";
                return (
                  <tr key={m._id} className="hover:bg-[#0F2D29]/4 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.user.name} src={m.user.avatar} size={9} />
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F2D29] font-['Goldman',sans-serif] truncate">
                            {m.user.name}
                          </p>
                          <p className="text-[11.5px] font-medium text-[#5B6E68] truncate">
                            {m.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {canManage && !isOwner ? (
                        <select
                          value={m.role}
                          disabled={isUpdatingMemberRole}
                          onChange={(e) => handleRoleChange(m, e.target.value as Role)}
                          className="border border-[#0F2D29]/15 bg-white px-2 py-1 text-[11.5px] font-bold text-[#0F2D29] outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="border border-[#0F2D29]/15 bg-[#0F2D29]/5 px-2.5 py-1 text-[11px] font-bold uppercase text-[#0F2D29]">
                          {ROLE_META[m.role].label}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[12px] font-medium text-[#5B6E68]">
                      {formatDate(m.joinedAt)}
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        {!isOwner && (
                          <button
                            type="button"
                            disabled={isRemovingMember}
                            onClick={() => setDeletingMember(m)}
                            className="p-1.5 text-[#5B6E68] hover:text-red-600 transition"
                            title="Remove member"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddMemberModal
          users={users}
          isLoadingUsers={isLoadingUsers}
          existingMemberUserIds={existingUserIds}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSubmit}
          isAdding={isAddingMember}
        />
      )}

      {deletingMember && (
        <DeleteMemberModal
          member={deletingMember}
          onClose={() => setDeletingMember(null)}
          onConfirm={() => {
            onRemoveMember(deletingMember.user.id, deletingMember.user.name);
            setDeletingMember(null);
          }}
        />
      )}
    </div>
  );
};
