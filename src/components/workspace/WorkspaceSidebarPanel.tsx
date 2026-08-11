import { Layers, Plus, Search, X, Loader2, AlertCircle } from "lucide-react";
import type { Workspace } from "./types";
import { WorkspaceListItem } from "./WorkspaceListItem";
import { SidebarEmpty } from "./WorkspaceEmptyPanels";

export interface WorkspaceSidebarPanelProps {
  workspaces: Workspace[];
  filteredWorkspaces: Workspace[];
  activeId: string | null;
  onSelectWorkspace: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
  isLoadingWorkspaces: boolean;
  isWorkspacesError: boolean;
  onOpenCreate: () => void;
}

export const WorkspaceSidebarPanel: React.FC<WorkspaceSidebarPanelProps> = ({
  workspaces,
  filteredWorkspaces,
  activeId,
  onSelectWorkspace,
  query,
  onQueryChange,
  isLoadingWorkspaces,
  isWorkspacesError,
  onOpenCreate,
}) => {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-80 xl:w-84">
      <div className="overflow-hidden border border-[#0F2D29]/12 bg-white shadow-2xs">
        <div className="border-b border-[#0F2D29]/10 bg-[#0F2D29]/4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center bg-[#0F2D29] text-white">
                <Layers size={17} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#0F2D29] font-['Goldman',sans-serif]">
                  Workspaces
                </p>
                <p className="text-[11px] font-semibold text-[#5B6E68]">
                  {workspaces.length} active spaces
                </p>
              </div>
            </div>
            <button
              onClick={onOpenCreate}
              className="flex h-9 w-9 items-center justify-center bg-[#0F2D29] text-white shadow-2xs transition hover:bg-[#081E1B]"
              aria-label="Create workspace"
              title="Create workspace"
            >
              <Plus size={17} strokeWidth={2.5} />
            </button>
          </div>

          {workspaces.length > 0 && (
            <div className="relative mt-3.5">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
              />
              <input
                id="workspace-search-input"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search spaces... (Press '/' to focus)"
                className="w-full border border-[#0F2D29]/15 bg-white py-2 pr-8 pl-9 text-[12.5px] font-semibold text-[#0F2D29] outline-none focus:border-[#0F2D29]"
              />
              {query && (
                <button
                  onClick={() => onQueryChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] hover:text-[#0F2D29]"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {isLoadingWorkspaces ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-14">
            <Loader2 size={20} className="animate-spin text-[#0F8A65]" />
            <p className="text-[12px] font-semibold text-[#5B6E68]">
              Loading workspaces...
            </p>
          </div>
        ) : isWorkspacesError ? (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
            <AlertCircle size={20} className="text-red-500" />
            <p className="text-[12.5px] font-bold text-[#0F2D29]">
              Couldn't load workspaces
            </p>
          </div>
        ) : workspaces.length === 0 ? (
          <SidebarEmpty onCreate={onOpenCreate} />
        ) : (
          <ul className="max-h-[min(560px,64vh)] space-y-1.5 overflow-y-auto p-2">
            {filteredWorkspaces.length === 0 ? (
              <li className="px-3 py-10 text-center">
                <Search size={22} className="mx-auto mb-2 text-[#8FA69E]/50" />
                <p className="text-[12.5px] font-bold text-[#5B6E68]">
                  No matches found
                </p>
              </li>
            ) : (
              filteredWorkspaces.map((ws) => (
                <WorkspaceListItem
                  key={ws._id}
                  workspace={ws}
                  active={ws._id === activeId}
                  onSelect={() => onSelectWorkspace(ws._id)}
                />
              ))
            )}
          </ul>
        )}
      </div>
    </aside>
  );
};
