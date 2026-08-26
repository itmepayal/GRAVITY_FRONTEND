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
      <SettingsPanel title="No workspace selected">
        <p className="text-[12.5px] text-[#5B6E68]">
          Choose a workspace from the sidebar to manage sharing settings.
        </p>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title={activeWorkspace.name}
      description="Manage who can access this workspace."
    >
      <WorkspaceShareSettings
        workspaceId={currentWorkspaceId}
        workspaceName={activeWorkspace.name}
        roles={workspaceRoles}
      />
    </SettingsPanel>
  );
}
