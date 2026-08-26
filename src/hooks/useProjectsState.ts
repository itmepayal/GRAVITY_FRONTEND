import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type Project,
  type ProjectStatus,
  normalizeProjectData,
} from "@/components/project/types";
import type { ProjectViewMode } from "@/components/project/ProjectFilterBar";
import { useSyncedWorkspace } from "@/hooks/useSyncedWorkspace";
import { useGetWorkspaceById } from "@/hooks/queries/workspace/use-get-workspace-by-id";
import { useGetWorkspaceRoles } from "@/hooks/queries/workspace/use-get-workspace-roles";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useCreateProject } from "@/hooks/mutations/project/use-create-project";
import { useUpdateProject } from "@/hooks/mutations/project/use-update-project";
import { useDeleteProject } from "@/hooks/mutations/project/use-delete-project";
import { type Toast, nextId } from "@/components/workspace";
import { useAuthStore } from "@/store/auth.store";

export function useProjectsState() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const {
    workspaces: syncedWorkspaces,
    setCurrentWorkspaceId,
    isLoadingWorkspaces,
  } = useSyncedWorkspace();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ProjectStatus>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ProjectViewMode>("grid");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const workspaces = useMemo(
    () =>
      syncedWorkspaces.map((workspace: any) => ({
        id: workspace.id ?? workspace._id,
        name: workspace.name ?? "Untitled Workspace",
      })),
    [syncedWorkspaces],
  );

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    if (workspaceId !== "all") {
      setCurrentWorkspaceId(workspaceId);
    }
  };

  const targetWorkspaceId =
    selectedWorkspaceId !== "all"
      ? selectedWorkspaceId
      : (workspaces[0]?.id ?? "");
  const { data: projectsResponse, isLoading: isLoadingProjects } =
    useGetWorkspaceProjects(targetWorkspaceId);

  const projects: Project[] = useMemo(() => {
    const raw = Array.isArray(projectsResponse)
      ? projectsResponse
      : (projectsResponse?.data ?? []);
    return raw.map(normalizeProjectData);
  }, [projectsResponse]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const { data: workspaceDetailResponse } = useGetWorkspaceById(
    targetWorkspaceId || undefined,
  );
  const { data: workspaceRolesResponse } = useGetWorkspaceRoles(
    targetWorkspaceId || undefined,
  );

  const workspaceDetail = useMemo(() => {
    const response = workspaceDetailResponse as
      | { data?: { members?: unknown[] } }
      | { members?: unknown[] }
      | null
      | undefined;
    if (!response) return null;
    return "data" in response && response.data ? response.data : response;
  }, [workspaceDetailResponse]);

  const availableUsers = useMemo(() => {
    const members = (workspaceDetail as { members?: unknown[] } | null)?.members ?? [];
    return members
      .map((m: any) => {
        const u = m.user ?? {};
        return {
          id: u._id ?? u.id,
          name: u.name ?? "Unknown",
          email: u.email ?? "",
          avatar: u.avatar ?? "",
        };
      })
      .filter((u: any) => Boolean(u.id));
  }, [workspaceDetail]);

  const workspaceRoles = useMemo(() => {
    const raw = Array.isArray(workspaceRolesResponse)
      ? workspaceRolesResponse
      : (workspaceRolesResponse?.data ?? []);
    return raw.map((r: any) => ({
      id: r._id ?? r.id,
      name: r.name,
    }));
  }, [workspaceRolesResponse]);

  const canManageSelectedProject = useMemo(() => {
    if (!selectedProject || !currentUser?.id) return false;
    if (selectedProject.owner?.id === currentUser.id) return true;

    const member = selectedProject.members.find(
      (m) => m.user.id === currentUser.id,
    );
    const roleName =
      typeof member?.role === "string"
        ? member.role
        : (member?.role as any)?.name;

    return roleName === "Admin" || roleName === "Owner";
  }, [selectedProject, currentUser]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Boolean(
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchStatus =
        selectedStatus === "all" || p.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [projects, searchQuery, selectedStatus]);

  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.status === "active" || p.status === "planning",
    ).length;
    const completedProjects = projects.filter(
      (p) => p.status === "completed",
    ).length;
    const totalMembers = projects.reduce((n, p) => n + p.members.length, 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalMembers,
    };
  }, [projects]);

  const addToast = (type: "success" | "info" | "warning", message: string) => {
    const id = nextId("tst");
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const { mutate: createProjectMutation, isPending: isCreatingProject } =
    useCreateProject();
  const { mutate: updateProjectMutation, isPending: isUpdatingProject } =
    useUpdateProject();
  const { mutate: deleteProjectMutation, isPending: isDeletingProject } =
    useDeleteProject();

  const handleCreateProject = (data: {
    name: string;
    description: string;
    workspaceId: string;
    status: ProjectStatus;
  }) => {
    createProjectMutation(
      {
        workspaceId: data.workspaceId,
        data: {
          name: data.name,
          description: data.description,
        },
      },
      {
        onSuccess: () => {
          addToast("success", `Project "${data.name}" created successfully!`);
          setCreateModalOpen(false);
          queryClient.invalidateQueries({
            queryKey: ["workspace-projects", data.workspaceId],
          });
        },
        onError: (err: any) => {
          addToast("warning", err?.message || "Failed to create project.");
        },
      },
    );
  };

  const handleUpdateProject = (
    projectId: string,
    data: { name?: string; description?: string; status?: ProjectStatus },
  ) => {
    const project = projects.find((p) => p.id === projectId) ?? editingProject;
    const workspaceId = (project as any)?.workspaceId ?? targetWorkspaceId;

    updateProjectMutation(
      {
        workspaceId,
        projectId,
        data,
      },
      {
        onSuccess: () => {
          addToast("info", "Project updated successfully!");
          setEditingProject(null);
          queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
        },
        onError: (err: any) => {
          addToast("warning", err?.message || "Failed to update project.");
        },
      },
    );
  };

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId) ?? selectedProject;
    const workspaceId = (project as any)?.workspaceId ?? targetWorkspaceId;
    deleteProjectMutation(
      { workspaceId, projectId },
      {
        onSuccess: () => {
          addToast("info", "Project deleted successfully!");
          setSelectedProjectId(null);
          queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
        },
        onError: (err: any) => {
          addToast("warning", err?.message || "Failed to delete project.");
        },
      },
    );
  };

  return {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId: handleWorkspaceChange,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    createModalOpen,
    setCreateModalOpen,
    selectedProject,
    setSelectedProject: (project: Project | string | null) => {
      if (project === null) return setSelectedProjectId(null);
      setSelectedProjectId(typeof project === "string" ? project : project.id);
    },

    editingProject,
    setEditingProject,
    toasts,
    projects: filteredProjects,
    metrics,
    isLoadingWorkspaces,
    isLoadingProjects,
    isCreatingProject,
    isUpdatingProject,
    isDeletingProject,
    handleCreateProject,
    handleUpdateProject,
    handleDeleteProject,
    currentUserId: currentUser?.id,
    canManageSelectedProject,
    availableUsers,
    workspaceRoles,
  };
}
