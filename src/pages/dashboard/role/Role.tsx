import React, { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useRolesState, type RoleItem } from "@/hooks/useRolesState";
import {
    Shield,
    ShieldAlert,
    Plus,
    Search,
    CheckCircle2,
    Lock,
    Edit2,
    Trash2,
    X,
    Check,
    ChevronRight,
} from "lucide-react";

export function Role() {
    const { openMobileNav } = useDashboardContext();

    const {
        workspaces,
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        searchQuery,
        setSearchQuery,
        roles,
        selectedRole,
        setSelectedRole,
        availablePermissions,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingRole,
        setEditingRole,
        deletingRole,
        setDeletingRole,
        isLoadingWorkspaces,
        isLoadingRoles,
        isLoadingPermissions,
        isCreatingRole,
        isUpdatingRole,
        isDeletingRole,
        handleCreateRole,
        handleUpdateRole,
        handleDeleteRole,
    } = useRolesState();

    const activeWorkspaceName =
        workspaces.find((w) => w.id === selectedWorkspaceId)?.name ?? "Workspace";

    return (
        <>
            <Topbar
                variant="light"
                title="Roles & Permissions"
                subtitle={`${activeWorkspaceName} · ${roles.length} Roles configured`}
                onMenuClick={openMobileNav}
            />

            <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Top Control Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#0F2D29]/10 pb-4">
                    <div className="flex items-center gap-3">
                        {/* Workspace Select */}
                        <select
                            value={selectedWorkspaceId}
                            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                            disabled={isLoadingWorkspaces}
                            className="rounded-xl border border-[#0F2D29]/20 bg-white px-3.5 py-2 text-xs font-bold text-[#0F2D29] outline-none shadow-2xs focus:border-[#0F2D29]"
                        >
                            {workspaces.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>

                        {/* Search Box */}
                        <div className="relative flex-1 sm:w-64">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6E68]"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search roles..."
                                className="w-full rounded-xl border border-[#0F2D29]/15 bg-white pl-9 pr-3 py-2 text-xs font-medium text-[#0F2D29] placeholder-[#5B6E68] outline-none focus:border-[#0F2D29]"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] transition shadow-xs cursor-pointer"
                    >
                        <Plus size={15} />
                        Create Custom Role
                    </button>
                </div>

                {/* Content Section */}
                {isLoadingRoles ? (
                    <div className="py-16 text-center text-xs font-semibold text-[#5B6E68]">
                        Loading workspace roles...
                    </div>
                ) : roles.length === 0 ? (
                    <div className="py-16 text-center text-xs font-semibold text-[#5B6E68]">
                        No roles found for this workspace.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Roles List */}
                        <div className="lg:col-span-1 space-y-3">
                            <p className="text-[10px] font-extrabold font-['Goldman',sans-serif] uppercase tracking-wider text-[#5B6E68]">
                                Configured Roles ({roles.length})
                            </p>

                            {roles.map((r) => {
                                const isSelected = selectedRole?.id === r.id;
                                return (
                                    <div
                                        key={r.id}
                                        onClick={() => setSelectedRole(r)}
                                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${isSelected
                                            ? "border-[#0F2D29] bg-[#0F2D29]/5 shadow-xs"
                                            : "border-[#0F2D29]/10 bg-white hover:border-[#0F2D29]/30 hover:bg-[#0F2D29]/2"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${r.isSystem
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-[#0F2D29]/10 text-[#0F2D29]"
                                                    }`}
                                            >
                                                {r.isSystem ? <Lock size={16} /> : <Shield size={16} />}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xs font-extrabold text-[#0F2D29]">
                                                        {r.name}
                                                    </h3>
                                                    {r.isSystem && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wider">
                                                            System
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-semibold text-[#5B6E68] mt-0.5">
                                                    {r.permissions.includes("*")
                                                        ? "All Permissions (*)"
                                                        : `${r.permissions.length} permissions assigned`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {!r.isSystem && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingRole(r);
                                                        }}
                                                        className="p-1.5 text-[#5B6E68] hover:text-[#0F2D29] hover:bg-[#0F2D29]/5 rounded-lg transition"
                                                        title="Edit Role"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletingRole(r);
                                                        }}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete Role"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                            <ChevronRight size={16} className="text-[#5B6E68]/50" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Role Details & Permissions Viewer */}
                        <div className="lg:col-span-2 rounded-2xl border border-[#0F2D29]/15 bg-white p-6 shadow-xs">
                            {selectedRole ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${selectedRole.isSystem
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-[#0F2D29] text-white"
                                                    }`}
                                            >
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-base font-extrabold font-['Goldman',sans-serif] text-[#0F2D29]">
                                                        {selectedRole.name}
                                                    </h2>
                                                    {selectedRole.isSystem && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                                            System Role (Read Only)
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-semibold text-[#5B6E68]">
                                                    Assigned Permissions Breakdown
                                                </p>
                                            </div>
                                        </div>

                                        {!selectedRole.isSystem && (
                                            <button
                                                type="button"
                                                onClick={() => setEditingRole(selectedRole)}
                                                className="flex items-center gap-1 rounded-lg border border-[#0F2D29]/20 px-3 py-1.5 text-xs font-extrabold text-[#0F2D29] hover:bg-[#0F2D29]/5 transition"
                                            >
                                                <Edit2 size={13} />
                                                Edit Permissions
                                            </button>
                                        )}
                                    </div>

                                    {/* Permissions List Grid */}
                                    <div>
                                        <h4 className="text-[10px] font-extrabold font-['Goldman',sans-serif] uppercase tracking-wider text-[#5B6E68] mb-3">
                                            Granted Permissions ({selectedRole.permissions.length})
                                        </h4>

                                        {selectedRole.permissions.includes("*") ? (
                                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
                                                <CheckCircle2 size={18} className="text-amber-600 shrink-0" />
                                                <p className="text-xs font-semibold">
                                                    Super Administrator Access — This role has full unrestricted permission (
                                                    <code className="font-bold">*</code>) across all workspace resources.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[450px] overflow-y-auto pr-1">
                                                {selectedRole.permissions.map((p) => (
                                                    <div
                                                        key={p}
                                                        className="flex items-center gap-2.5 rounded-xl border border-[#0F2D29]/10 bg-[#0F2D29]/2 p-2.5"
                                                    >
                                                        <CheckCircle2 size={14} className="text-[#0F2D29] shrink-0" />
                                                        <span className="text-xs font-bold font-mono text-[#0F2D29]">
                                                            {p}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-24 text-center text-xs font-semibold text-[#5B6E68]">
                                    Select a role from the list to view its permission matrix.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* --- Create Role Modal --- */}
            {isCreateModalOpen && (
                <RoleModal
                    title="Create Custom Role"
                    availablePermissions={availablePermissions}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateRole}
                    isSubmitting={isCreatingRole}
                />
            )}

            {/* --- Edit Role Modal --- */}
            {editingRole && (
                <RoleModal
                    title={`Edit Role: ${editingRole.name}`}
                    initialName={editingRole.name}
                    initialPermissions={editingRole.permissions}
                    availablePermissions={availablePermissions}
                    onClose={() => setEditingRole(null)}
                    onSubmit={handleUpdateRole}
                    isSubmitting={isUpdatingRole}
                />
            )}

            {/* --- Delete Confirmation Modal --- */}
            {deletingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                        onClick={() => setDeletingRole(null)}
                    />
                    <div className="relative w-full max-w-md rounded-2xl border border-[#0F2D29]/15 bg-white p-6 shadow-2xl z-10 space-y-4">
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-900">
                            <ShieldAlert size={20} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-xs font-medium leading-relaxed">
                                Are you sure you want to delete custom role{" "}
                                <strong className="font-bold">{deletingRole.name}</strong>?
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingRole(null)}
                                className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingRole}
                                onClick={handleDeleteRole}
                                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-red-700 disabled:opacity-50 transition"
                            >
                                {isDeletingRole ? "Deleting..." : "Delete Role"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// --- Inner Role Modal Component for Create / Edit ---
interface RoleModalProps {
    title: string;
    initialName?: string;
    initialPermissions?: string[];
    availablePermissions: string[];
    onClose: () => void;
    onSubmit: (data: { name: string; permissions: string[] }) => void;
    isSubmitting?: boolean;
}

const RoleModal: React.FC<RoleModalProps> = ({
    title,
    initialName = "",
    initialPermissions = [],
    availablePermissions,
    onClose,
    onSubmit,
    isSubmitting,
}) => {
    const [name, setName] = useState(initialName);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        initialPermissions,
    );

    const DEFAULT_PERMISSIONS = [
        "workspace:view", "workspace:update", "workspace:delete",
        "project:create", "project:view", "project:update", "project:delete",
        "member:add", "member:update", "member:remove",
        "board:create", "board:view", "board:update", "board:delete",
        "sprint:create", "sprint:view", "sprint:update", "sprint:delete",
        "task:create", "task:view", "task:update", "task:delete", "task:assign", "task:archive",
        "team:create", "team:view", "team:update", "team:delete", "team:members:add", "team:members:remove", "team:lead:change"
    ];

    const permissionsList = availablePermissions.length > 0 ? availablePermissions : DEFAULT_PERMISSIONS;

    const togglePermission = (perm: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
        );
    };

    const toggleAll = () => {
        if (selectedPermissions.length === permissionsList.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...permissionsList]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || selectedPermissions.length === 0) return;
        onSubmit({
            name: name.trim(),
            permissions: selectedPermissions,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg rounded-2xl border border-[#0F2D29]/15 bg-white p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[#0F2D29]/10 pb-3">
                    <h3 className="text-base font-extrabold font-['Goldman',sans-serif] text-[#0F2D29]">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-[#5B6E68] hover:bg-[#0F2D29]/5 rounded-lg transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider mb-1">
                            Role Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. QA Specialist"
                            className="w-full rounded-lg border border-[#0F2D29]/20 bg-[#0F2D29]/3 px-3 py-2 text-xs font-medium text-[#0F2D29] outline-none focus:border-[#0F2D29]"
                            autoFocus
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block font-extrabold font-['Goldman',sans-serif] text-[10px] text-[#0F2D29]/80 uppercase tracking-wider">
                                Select Permissions * ({selectedPermissions.length})
                            </label>

                            <button
                                type="button"
                                onClick={toggleAll}
                                className="text-[10px] font-bold text-[#0F2D29] hover:underline"
                            >
                                {selectedPermissions.length === permissionsList.length
                                    ? "Deselect All"
                                    : "Select All"}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-[#0F2D29]/15 rounded-xl bg-[#0F2D29]/2">
                            {permissionsList.map((p) => {
                                const isChecked = selectedPermissions.includes(p);
                                return (
                                    <div
                                        key={p}
                                        onClick={() => togglePermission(p)}
                                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition select-none ${isChecked
                                            ? "border-[#0F2D29] bg-[#0F2D29]/10 text-[#0F2D29] font-bold"
                                            : "border-[#0F2D29]/10 bg-white text-[#5B6E68]"
                                            }`}
                                    >
                                        <div
                                            className={`h-4 w-4 rounded flex items-center justify-center border transition ${isChecked
                                                ? "border-[#0F2D29] bg-[#0F2D29] text-white"
                                                : "border-[#0F2D29]/30"
                                                }`}
                                        >
                                            {isChecked && <Check size={12} />}
                                        </div>
                                        <span className="text-[11px] font-mono truncate">{p}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2 border-t border-[#0F2D29]/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-bold text-[#0F2D29]/70 hover:bg-[#0F2D29]/5 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || selectedPermissions.length === 0 || isSubmitting}
                            className="rounded-lg bg-[#0F2D29] px-4 py-2 text-xs font-extrabold font-['Goldman',sans-serif] text-white hover:bg-[#081E1B] disabled:opacity-50 transition"
                        >
                            {isSubmitting ? "Saving..." : "Save Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Role;