import { WorkspaceShareSettings } from "@/components/workspace/WorkspaceShareSettings";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import {
  useGetUserWorkspaces,
  useGetWorkspaceRoles,
} from "@/hooks/queries/settings";

type WorkspaceSettingsProps = {
  currentWorkspaceId?: string;
};

export function WorkspaceSettings({
  currentWorkspaceId,
}: WorkspaceSettingsProps) {
  const { data: workspacesResponse } = useGetUserWorkspaces();
  const workspaces = workspacesResponse?.data ?? [];
  const activeWorkspace =
    workspaces.find((ws) => (ws._id || ws.id) === currentWorkspaceId) ??
    workspaces[0];

  const { data: rolesResponse } = useGetWorkspaceRoles(
    currentWorkspaceId ?? "",
  );
  const workspaceRoles =
    (rolesResponse as { data?: { id?: string; _id?: string; name: string }[] })
      ?.data ?? [];

  if (!activeWorkspace || !currentWorkspaceId) {
    return (
      <div className="rounded-xl border border-dashed border-[#0F2D29]/15 bg-[#F8F7F3]/40 px-5 py-10 text-center">
        <p className="text-[13px] font-semibold text-[#0F2D29]">
          No workspace selected
        </p>
        <p className="mt-1 text-[12px] text-[#5B6E68]">
          Choose a workspace from the sidebar to manage sharing settings.
        </p>
      </div>
    );
  }

  return (
    <SettingsPanel
      title={activeWorkspace.name}
      description="Manage who can access this workspace and invite members."
      className="overflow-hidden"
    >
      <WorkspaceShareSettings
        workspaceId={currentWorkspaceId}
        workspaceName={activeWorkspace.name}
        roles={workspaceRoles}
      />
    </SettingsPanel>
  );
}
