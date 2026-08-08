import { useMemo, useState, useEffect, useRef } from "react";
import {
  Building2,
  FolderKanban,
  Search,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Users,
  CalendarClock,
  ListChecks,
  Crown,
  Archive,
  ArchiveRestore,
  PauseCircle,
  Ban,
  Rocket,
  ClipboardList,
  UserPlus,
  Loader2,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { type Toast, nextId } from "@/components/workspace";
import { useGetUserWorkspaces } from "@/hooks/queries/workspace/use-get-user-workspaces";
import { useGetWorkspaceProjects } from "@/hooks/queries/project/use-get-workspace-projects";
import { useGetAllUsers } from "@/hooks/queries/users/use-get-all-users";
import { useAddProjectMember } from "@/hooks/mutations/project/use-add-project-member";
import { useQueryClient } from "@tanstack/react-query";

type ProjectStatus =
  | "planning"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

interface RefUser {
  id: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

interface ProjectMember {
  user: RefUser | string;
  role: { id: string; name?: string } | string;
  joinedAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  workspace: string;
  owner: RefUser | string;
  members: ProjectMember[];
  tasks: string[];
  color: string;
  status: ProjectStatus;
  progress: number;
  isArchived: boolean;
  archivedAt?: string;
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_META: Record<
  ProjectStatus,
  { label: string; icon: typeof Rocket; color: string }
> = {
  planning: { label: "Planning", icon: ClipboardList, color: "#8B5CF6" },
  active: { label: "Active", icon: Rocket, color: "#0F8A65" },
  on_hold: { label: "On hold", icon: PauseCircle, color: "#D97706" },
  completed: { label: "Completed", icon: CheckCircle2, color: "#2563EB" },
  cancelled: { label: "Cancelled", icon: Ban, color: "#DC2626" },
  archived: { label: "Archived", icon: Archive, color: "#5B6E68" },
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

const DEFAULT_COLOR = "#6366F1";

const normalizeUser = (raw: any): RefUser => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? raw.email ?? "Unknown",
  email: raw.email ?? "",
  avatar: raw.avatar ?? null,
});

const normalizeProject = (raw: any): Project => ({
  id: raw._id ?? raw.id,
  name: raw.name ?? "Untitled",
  description: raw.description ?? "",
  workspace: raw.workspace?._id ?? raw.workspace?.id ?? raw.workspace,
  owner:
    typeof raw.owner === "object" && raw.owner !== null
      ? normalizeUser(raw.owner)
      : raw.owner,
  members: Array.isArray(raw.members) ? raw.members : [],
  tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
  color: raw.color || DEFAULT_COLOR,
  status: raw.status ?? "planning",
  progress: Math.min(100, Math.max(0, raw.progress ?? 0)),
  isArchived: !!raw.isArchived,
  archivedAt: raw.archivedAt,
  startDate: raw.startDate,
  dueDate: raw.dueDate,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt ?? raw.createdAt,
});

const initials = (name?: string) =>
  (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const relativeTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value) ?? value;
};

const ProjectRowSkeleton = () => (
  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
    <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-[#0F2D29]/8" />
    <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#0F2D29]/8" />
  </div>
);

const AddMemberModal = ({
  project,
  candidates,
  onClose,
}: {
  project: Project;
  candidates: RefUser[];
  onClose: () => void;
}) => {
  const [userId, setUserId] = useState(candidates[0]?.id ?? "");
  const [role, setRole] = useState(ROLE_OPTIONS[1].value);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { mutate, isPending } = useAddProjectMember();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current?.querySelector("select")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    mutate(
      { projectId: project.id, data: { userId, role } },
      { onSuccess: onClose },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-2xl border border-[#0F2D29]/10 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8FE3C4]/25 ring-1 ring-[#8FE3C4]/40">
              <UserPlus size={16} className="text-[#0F8A65]" />
            </div>
            <div>
              <h2
                id="add-member-title"
                className="text-[14.5px] font-bold text-[#0F2D29]"
              >
                Add member
              </h2>
              <p className="text-[11.5px] text-[#5B6E68]">
                Invite someone to {project.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#8FA69E] transition hover:text-[#0F2D29]"
          >
            <X size={16} />
          </button>
        </div>

        {candidates.length === 0 ? (
          <p className="mt-5 rounded-xl bg-[#0F2D29]/4 px-3.5 py-3 text-[12.5px] text-[#5B6E68]">
            Everyone in this workspace is already on the project.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-semibold text-[#0F2D29]">
                Person
              </span>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-xl border border-[#0F2D29]/10 bg-white px-3 py-2 text-[12.5px] text-[#0F2D29] outline-none transition focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20"
              >
                {candidates.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                    {u.email ? ` · ${u.email}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11.5px] font-semibold text-[#0F2D29]">
                Role
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-[#0F2D29]/10 bg-white px-3 py-2 text-[12.5px] text-[#0F2D29] outline-none transition focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-end gap-2 pt-1.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3.5 py-2 text-[12.5px] font-semibold text-[#5B6E68] transition hover:bg-[#0F2D29]/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !userId}
                className="flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-[#0F2D29]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                {isPending ? "Adding…" : "Add member"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Projects = () => {
  const { openMobileNav } = useDashboardContext();
  const queryClient = useQueryClient();

  const { data: workspacesResponse, isLoading: isLoadingWorkspaces } =
    useGetUserWorkspaces();
  const workspaces = Array.isArray(workspacesResponse)
    ? workspacesResponse
    : (workspacesResponse?.data ?? []);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null,
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspaceId(workspaces[0]._id ?? workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);

  const {
    data: projectsResponse,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
    isFetching: isFetchingProjects,
  } = useGetWorkspaceProjects(activeWorkspaceId ?? "");

  const allProjects: Project[] = useMemo(() => {
    const raw = Array.isArray(projectsResponse)
      ? projectsResponse
      : (projectsResponse?.data ?? []);
    return raw.map(normalizeProject);
  }, [projectsResponse]);

  const projects = useMemo(
    () => allProjects.filter((p) => showArchived || !p.isArchived),
    [allProjects, showArchived],
  );
  const archivedCount = useMemo(
    () => allProjects.filter((p) => p.isArchived).length,
    [allProjects],
  );

  const { data: usersResponse, isLoading: isLoadingUsers } = useGetAllUsers();
  const users = useMemo(() => {
    const raw = Array.isArray(usersResponse)
      ? usersResponse
      : (usersResponse ?? []);
    return raw.map(normalizeUser);
  }, [usersResponse]);
  const usersById = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users],
  );

  const addToast = (type: Toast["type"], message: string) => {
    const id = nextId("tst");
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;

  console.log(activeProject);

  useEffect(() => {
    if (activeProjectId && !projects.some((p) => p.id === activeProjectId)) {
      setActiveProjectId(null);
    }
  }, [projects, activeProjectId]);

  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [projects, activeProjectId]);

  useEffect(() => {
    setIsAddMemberOpen(false);
  }, [activeProjectId]);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()),
      ),
    [projects, query],
  );

  const activeWorkspace = workspaces.find(
    (w: any) => (w._id ?? w.id) === activeWorkspaceId,
  );
  const canManage =
    activeWorkspace?.role === "owner" || activeWorkspace?.role === "admin";

  console.log(activeWorkspace);

  const refreshAll = () => {
    queryClient.invalidateQueries({
      queryKey: ["projects", activeWorkspaceId],
    });
    addToast("info", "Projects refreshed.");
  };

  const resolveOwner = (owner: Project["owner"]): RefUser | null => {
    if (!owner) return null;
    if (typeof owner === "string") return usersById.get(owner) ?? null;
    return owner;
  };

  const resolveMemberUser = (member: ProjectMember): RefUser | null => {
    if (typeof member.user === "string")
      return usersById.get(member.user) ?? null;
    return member.user;
  };

  const memberUserIds = useMemo(() => {
    if (!activeProject) return new Set<string>();
    return new Set(
      activeProject.members
        .map((m) => (typeof m.user === "string" ? m.user : m.user?.id))
        .filter(Boolean) as string[],
    );
  }, [activeProject]);

  const ownerId = activeProject
    ? typeof activeProject.owner === "string"
      ? activeProject.owner
      : activeProject.owner?.id
    : undefined;

  const addableUsers = useMemo(
    () => users.filter((u) => !memberUserIds.has(u.id) && u.id !== ownerId),
    [users, memberUserIds, ownerId],
  );

  return (
    <>
      <Topbar
        title="Projects"
        subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"} in this workspace`}
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex max-w-8xl flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-80 xl:w-84">
            <div className="overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white/90 shadow-[0_2px_12px_rgba(15,45,41,0.05)] backdrop-blur-md">
              <div className="border-b border-[#0F2D29]/6 bg-linear-to-br from-[#8FE3C4]/10 via-transparent to-[#0F2D29]/2 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8FE3C4]/25 ring-1 ring-[#8FE3C4]/40">
                      <FolderKanban size={17} className="text-[#0F8A65]" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold text-[#0F2D29]">
                        Projects
                      </p>
                      <p className="text-[11px] text-[#5B6E68]">
                        {isLoadingProjects
                          ? "Loading…"
                          : `${projects.length} in this workspace`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={refreshAll}
                    disabled={isFetchingProjects}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#0F2D29]/10 bg-white text-[#0F2D29] shadow-sm transition hover:bg-[#0F2D29]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE3C4] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Refresh projects"
                    title="Refresh"
                  >
                    <RefreshCw
                      size={15}
                      className={isFetchingProjects ? "animate-spin" : ""}
                    />
                  </button>
                </div>

                {workspaces.length > 1 && (
                  <label className="mt-3.5 block">
                    <span className="sr-only">Workspace</span>
                    <div className="relative">
                      {activeWorkspace?.color && (
                        <span
                          className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                          style={{ backgroundColor: activeWorkspace.color }}
                        />
                      )}
                      <select
                        value={activeWorkspaceId ?? ""}
                        onChange={(e) => {
                          setActiveWorkspaceId(e.target.value);
                          setActiveProjectId(null);
                        }}
                        className={`w-full rounded-xl border border-[#0F2D29]/10 bg-white py-2 pr-3 text-[12.5px] text-[#0F2D29] outline-none transition focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20 ${activeWorkspace?.color ? "pl-7" : "pl-3"}`}
                      >
                        {workspaces.map((w: any) => (
                          <option key={w._id ?? w.id} value={w._id ?? w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                )}

                {(allProjects.length > 0 || query) && (
                  <div className="relative mt-3.5">
                    <Search
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA69E]"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search projects..."
                      aria-label="Search projects"
                      className="w-full rounded-xl border border-[#0F2D29]/10 bg-white py-2 pr-8 pl-9 text-[12.5px] text-[#0F2D29] outline-none placeholder:text-[#8FA69E] transition focus:border-[#8FE3C4] focus:ring-2 focus:ring-[#8FE3C4]/20"
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8FA69E] transition hover:text-[#0F2D29]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                {archivedCount > 0 && (
                  <button
                    onClick={() => setShowArchived((v) => !v)}
                    className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11.5px] font-semibold transition ${
                      showArchived
                        ? "border-[#0F2D29]/20 bg-[#0F2D29]/5 text-[#0F2D29]"
                        : "border-[#0F2D29]/10 text-[#5B6E68] hover:bg-[#0F2D29]/5"
                    }`}
                  >
                    {showArchived ? (
                      <ArchiveRestore size={13} />
                    ) : (
                      <Archive size={13} />
                    )}
                    {showArchived
                      ? "Hide archived"
                      : `Show ${archivedCount} archived`}
                  </button>
                )}
              </div>

              {isLoadingWorkspaces || isLoadingProjects ? (
                <div className="space-y-1.5 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ProjectRowSkeleton key={i} />
                  ))}
                </div>
              ) : isProjectsError ? (
                <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="text-[12.5px] font-medium text-[#0F2D29]">
                    Couldn't load projects
                  </p>
                  <p className="text-[11.5px] text-[#5B6E68]">
                    Check your connection and try again.
                  </p>
                  <button
                    onClick={refreshAll}
                    className="mt-1 rounded-lg border border-[#0F2D29]/15 px-3 py-1.5 text-[12px] font-semibold text-[#0F2D29] transition hover:bg-[#0F2D29]/5"
                  >
                    Try again
                  </button>
                </div>
              ) : projects.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8FE3C4]/20">
                    <Building2 size={22} className="text-[#0F8A65]" />
                  </div>
                  <p className="text-[13.5px] font-bold text-[#0F2D29]">
                    No projects yet
                  </p>
                  <p className="mt-1 text-[12px] text-[#5B6E68]">
                    Create a project from the Workspaces page to see it here.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-[13px] font-semibold text-[#0F2D29]">
                    No matches for "{query}"
                  </p>
                  <p className="mt-1 text-[12px] text-[#5B6E68]">
                    Try a different search term.
                  </p>
                </div>
              ) : (
                <ul
                  className="max-h-[min(560px,64vh)] space-y-1.5 overflow-y-auto p-2"
                  role="listbox"
                  aria-label="Projects"
                >
                  {filtered.map((p) => {
                    const meta = STATUS_META[p.status];
                    const StatusIcon = meta.icon;
                    const active = p.id === activeProjectId;
                    return (
                      <li key={p.id} role="presentation">
                        <button
                          onClick={() => setActiveProjectId(p.id)}
                          role="option"
                          aria-selected={active}
                          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE3C4] ${
                            active
                              ? "bg-[#0F2D29] text-white"
                              : "hover:bg-[#0F2D29]/5"
                          }`}
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: active
                                ? "rgba(255,255,255,0.15)"
                                : `${p.color}1F`,
                              color: active ? "#fff" : p.color,
                            }}
                          >
                            <FolderKanban size={15} />
                          </div>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`flex items-center gap-1.5 truncate text-[13px] font-semibold ${
                                active ? "text-white" : "text-[#0F2D29]"
                              }`}
                            >
                              <span className="truncate">{p.name}</span>
                              {p.isArchived && (
                                <Archive
                                  size={11}
                                  className={
                                    active ? "text-white/60" : "text-[#8FA69E]"
                                  }
                                />
                              )}
                            </span>
                            <span
                              className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${
                                active ? "text-white/60" : "text-[#8FA69E]"
                              }`}
                            >
                              <StatusIcon
                                size={11}
                                style={{
                                  color: active ? undefined : meta.color,
                                }}
                              />
                              {meta.label}
                              <span
                                className={
                                  active ? "text-white/40" : "text-[#8FA69E]/60"
                                }
                              >
                                ·
                              </span>
                              {p.progress}%
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            {!activeProject ? (
              <div className="flex min-h-115 flex-col items-center justify-center rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/80 px-6 py-16 text-center shadow-xs">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8FE3C4]/20 ring-1 ring-[#8FE3C4]/40">
                  <FolderKanban size={28} className="text-[#0F8A65]" />
                </div>
                <h2 className="text-[18px] font-bold tracking-tight text-[#0F2D29]">
                  Select a project
                </h2>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#5B6E68]">
                  Choose a project from the sidebar to view its boards, sprints,
                  tasks, and members.
                </p>
              </div>
            ) : (
              (() => {
                const meta = STATUS_META[activeProject.status];
                const StatusIcon = meta.icon;
                const owner = resolveOwner(activeProject.owner);
                const dueDate = formatDate(activeProject.dueDate);
                const startDate = formatDate(activeProject.startDate);
                const isOverdue =
                  activeProject.dueDate &&
                  !["completed", "cancelled", "archived"].includes(
                    activeProject.status,
                  ) &&
                  new Date(activeProject.dueDate).getTime() < Date.now();
                const visibleMembers = activeProject.members.slice(0, 5);
                const extraMembers =
                  activeProject.members.length - visibleMembers.length;

                return (
                  <div className="space-y-5">
                    <div
                      className="overflow-hidden rounded-2xl border border-[#0F2D29]/10 bg-white/90 shadow-[0_2px_12px_rgba(15,45,41,0.05)] backdrop-blur-md"
                      style={{ borderTop: `3px solid ${activeProject.color}` }}
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: activeProject.color }}
                              />
                              <h1 className="truncate text-[19px] font-bold tracking-tight text-[#0F2D29]">
                                {activeProject.name}
                              </h1>
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                style={{
                                  backgroundColor: `${meta.color}1A`,
                                  color: meta.color,
                                }}
                              >
                                <StatusIcon size={11} />
                                {meta.label}
                              </span>
                              {activeProject.isArchived && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#0F2D29]/8 px-2.5 py-1 text-[11px] font-semibold text-[#5B6E68]">
                                  <Archive size={11} />
                                  Archived
                                </span>
                              )}
                              {isOverdue && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                                  <AlertCircle size={11} />
                                  Overdue
                                </span>
                              )}
                            </div>
                            {activeProject.description && (
                              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[#5B6E68]">
                                {activeProject.description}
                              </p>
                            )}
                            {owner && (
                              <p className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-[#5B6E68]">
                                <Crown size={12} className="text-[#D97706]" />
                                Owned by{" "}
                                <span className="font-semibold text-[#0F2D29]">
                                  {owner.name}
                                </span>
                              </p>
                            )}
                          </div>

                          {canManage && (
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                onClick={() => setIsAddMemberOpen(true)}
                                className="flex items-center gap-1.5 rounded-xl border border-[#0F2D29]/15 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0F2D29] shadow-sm transition hover:bg-[#0F2D29]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE3C4]"
                              >
                                <UserPlus size={14} />
                                Add member
                              </button>
                              <button className="rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-[#0F2D29]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FE3C4]">
                                Manage project
                              </button>
                            </div>
                          )}
                        </div>

                        <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-[#0F2D29]/6 pt-5 sm:grid-cols-3">
                          <div className="flex items-center gap-3 rounded-xl bg-[#0F2D29]/3 px-3.5 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8FE3C4]/25 text-[#0F8A65]">
                              <ListChecks size={16} />
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[11px] text-[#5B6E68]">
                                Tasks
                              </dt>
                              <dd className="text-[13.5px] font-bold text-[#0F2D29]">
                                {activeProject.tasks.length}
                              </dd>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-xl bg-[#0F2D29]/3 px-3.5 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8FE3C4]/25 text-[#0F8A65]">
                              <Users size={16} />
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[11px] text-[#5B6E68]">
                                Members
                              </dt>
                              <dd className="text-[13.5px] font-bold text-[#0F2D29]">
                                {isLoadingUsers
                                  ? "…"
                                  : activeProject.members.length}
                              </dd>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-xl bg-[#0F2D29]/3 px-3.5 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8FE3C4]/25 text-[#0F8A65]">
                              <CalendarClock size={16} />
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[11px] text-[#5B6E68]">
                                {dueDate ? "Due date" : "Last updated"}
                              </dt>
                              <dd
                                className={`text-[13.5px] font-bold ${isOverdue ? "text-red-600" : "text-[#0F2D29]"}`}
                              >
                                {dueDate ??
                                  relativeTime(activeProject.updatedAt)}
                              </dd>
                            </div>
                          </div>
                        </dl>

                        {(startDate || dueDate) && (
                          <p className="mt-3 text-[11.5px] text-[#8FA69E]">
                            {startDate && <>Starts {startDate}</>}
                            {startDate && dueDate && " · "}
                            {dueDate && <>Due {dueDate}</>}
                          </p>
                        )}

                        <div className="mt-5">
                          <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#5B6E68]">
                            <span>Progress</span>
                            <span>{activeProject.progress}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#0F2D29]/8">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${activeProject.progress}%`,
                                backgroundColor: activeProject.color,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#0F2D29]/6 pt-4">
                          <div className="flex items-center gap-2">
                            {activeProject.members.length > 0 ? (
                              <>
                                <div className="flex -space-x-2">
                                  {visibleMembers.map((m, i) => {
                                    const u = resolveMemberUser(m);
                                    return (
                                      <div
                                        key={i}
                                        title={u?.name ?? "Member"}
                                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#0F2D29] text-[10.5px] font-bold text-white"
                                      >
                                        {initials(u?.name)}
                                      </div>
                                    );
                                  })}
                                </div>
                                {extraMembers > 0 && (
                                  <span className="text-[11.5px] font-medium text-[#5B6E68]">
                                    +{extraMembers} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[11.5px] text-[#8FA69E]">
                                No members yet
                              </span>
                            )}
                          </div>

                          {!canManage && (
                            <span className="text-[11px] text-[#8FA69E]">
                              Ask a workspace admin to add members
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-[#0F2D29]/15 bg-white/60 px-6 py-14 text-center">
                      <p className="text-[13px] text-[#5B6E68]">
                        Boards, sprints, and task lists for{" "}
                        <span className="font-semibold text-[#0F2D29]">
                          {activeProject.name}
                        </span>{" "}
                        render here.
                      </p>
                    </div>

                    {isAddMemberOpen && (
                      <AddMemberModal
                        project={activeProject}
                        candidates={addableUsers}
                        onClose={() => setIsAddMemberOpen(false)}
                      />
                    )}
                  </div>
                );
              })()
            )}
          </section>
        </div>
      </main>

      <div
        className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-[#0F2D29]/15 bg-[#0F2D29] px-4 py-3 text-[13px] font-medium text-white shadow-xl backdrop-blur-md"
          >
            {t.type === "success" && (
              <CheckCircle2 size={16} className="shrink-0 text-[#8FE3C4]" />
            )}
            {t.type === "info" && (
              <Sparkles size={16} className="shrink-0 text-[#93C5FD]" />
            )}
            {t.type === "warning" && (
              <AlertCircle size={16} className="shrink-0 text-[#FCD34D]" />
            )}
            <span>{t.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
              aria-label="Dismiss notification"
              className="ml-1 text-white/50 transition hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Projects;
