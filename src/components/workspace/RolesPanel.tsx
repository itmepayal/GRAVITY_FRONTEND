import { useMemo, useState } from "react";
import { Shield, Plus, Loader2, Lock, ShieldCheck } from "lucide-react";
import { PanelEmpty } from "./SharedHelpers";
import { useGetWorkspaceRoles } from "@/hooks/queries/workspace/use-get-workspace-roles";
import { useCreateWorkspaceRole } from "@/hooks/mutations/workspace/use-create-workspace-role";
import { CreateRoleModal } from "./CreateRoleModal";

export interface CustomRole {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
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
  const [showCreate, setShowCreate] = useState(false);
  const { data: rolesResponse, isLoading: isLoadingRoles } =
    useGetWorkspaceRoles(workspaceId);
  const { mutate: createRoleMutation, isPending: isCreatingRole } =
    useCreateWorkspaceRole();

  const roles: CustomRole[] = useMemo(() => {
    const raw = Array.isArray(rolesResponse)
      ? rolesResponse
      : (rolesResponse?.data ?? []);
    return raw.map((r: any) => ({
      _id: r._id ?? r.id,
      name: r.name ?? "Role",
      description: r.description ?? undefined,
      permissions: r.permissions ?? [],
      isSystem: r.isSystem ?? false,
    }));
  }, [rolesResponse]);

  const handleCreateSubmit = (
    name: string,
    description: string,
    permissions: string[],
  ) => {
    createRoleMutation(
      {
        workspaceId,
        data: { name, description, permissions } as {
          name: string;
          description?: string;
          permissions: string[];
        },
      },
      {
        onSuccess: () => {
          addActivity("created custom role", name, "role");
          addToast("success", `Role "${name}" created successfully!`);
          setShowCreate(false);
        },
        onError: (err: any) => {
          addToast("warning", err?.message || "Failed to create role.");
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
        <div>
          <h3 className="text-[17px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] flex items-center gap-2">
            <Shield size={20} className="text-[#0F2D29]" />
            Workspace Roles & Permissions ({roles.length})
          </h3>
          <p className="text-[12.5px] font-medium text-[#5B6E68] mt-0.5">
            Configure RBAC permissions for workspace members.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Role
          </button>
        )}
      </div>

      {isLoadingRoles ? (
        <div className="flex items-center justify-center gap-2 py-12">
          <Loader2 size={20} className="animate-spin text-[#0F2D29]" />
          <span className="text-[13px] font-semibold text-[#5B6E68]">
            Loading custom roles...
          </span>
        </div>
      ) : roles.length === 0 ? (
        <PanelEmpty
          title="No custom roles created"
          description="Create customized permission roles for team leads and contributors."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r._id}
              className="border border-[#0F2D29]/15 bg-white p-5 hover:border-[#0F2D29] transition shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#0F2D29]" />
                    <h4 className="text-[16px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
                      {r.name}
                    </h4>
                  </div>
                  {r.isSystem && (
                    <span className="inline-flex items-center gap-1 border border-[#0F2D29]/20 bg-[#0F2D29]/5 px-2 py-0.5 text-[10px] font-bold uppercase text-[#0F2D29]">
                      <Lock size={10} /> System
                    </span>
                  )}
                </div>

                <p className="text-[12.5px] font-medium text-[#5B6E68] line-clamp-2">
                  {r.description || "Custom workspace permission role."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#0F2D29]/10 text-[12px] font-semibold text-[#5B6E68]">
                <span>{r.permissions.length} Permissions Granted</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateRoleModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateSubmit}
          isSubmitting={isCreatingRole}
        />
      )}
    </div>
  );
};
