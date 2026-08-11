import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type Project,
  type ProjectStatus,
  normalizeProjectData,
} from "@/components/project/types";
import type { ProjectViewMode } from "@/components/project/ProjectFilterBar";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useCreateProject } from "@/hooks/mutations/project/use-create-project";
import { useUpdateProject } from "@/hooks/mutations/project/use-update-project";
import { useDeleteProject } from "@/hooks/mutations/project/use-delete-project";
import { type Toast, nextId } from "@/components/workspace";

export function useProjectsState() {
  const queryClient = useQueryClient();

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ProjectStatus>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ProjectViewMode>("grid");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Fetch workspaces
  const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();
  const workspaces = useMemo(() => {
    const raw = Array.isArray(workspacesResponse)
      ? workspacesResponse
      : (workspacesResponse?.data ?? []);
    return raw.map((w: any) => ({
      id: w._id ?? w.id,
      name: w.name ?? "Untitled Workspace",
    }));
  }, [workspacesResponse]);

  // Set default workspace if available
  useEffect(() => {
    if (workspaces.length > 0 && selectedWorkspaceId === "all") {
      // Keep "all" or set first workspace
    }
  }, [workspaces]);

  // Fetch Projects for selected workspace (or primary workspace)
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

  // Filtered Projects
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

  // Metrics
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

  // Toast Helper
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

    const { status, ...updateData } = data;

    updateProjectMutation(
      {
        workspaceId,
        projectId,
        data: updateData,
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
          setSelectedProject(null);
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
    setSelectedWorkspaceId,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    createModalOpen,
    setCreateModalOpen,
    selectedProject,
    setSelectedProject,
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
  };
}
