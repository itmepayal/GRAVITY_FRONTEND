import { useState, type FormEvent } from "react";
import {
  FolderKanban,
  Plus,
  X,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import {
  type Project,
  type ProjectStatus,
  type ProjectView,
  PROJECT_STATUS_META,
  nextId,
  inputClass,
} from "./types";
import { SharedHelpers } from "./SharedHelpers";

const { PanelToolbar, ViewToggle, PanelEmpty, NoResults } = SharedHelpers;

interface ProjectsPanelProps {
  projects: Project[];
  canManage: boolean;
  onChange: (projects: Project[]) => void;
  onSelectProject: (p: Project) => void;
  addActivity: (action: string, target: string, iconType: "project") => void;
  addToast: (type: "success" | "info" | "warning", msg: string) => void;
}

export const ProjectsPanel = ({
  projects,
  canManage,
  onChange,
  onSelectProject,
  addActivity,
  addToast,
}: ProjectsPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("in-progress");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ProjectView>("grid");

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const create = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newProj: Project = {
      _id: nextId("p"),
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      taskCount: 0,
      completedTaskCount: 0,
      updatedAt: "Just now",
    };
    onChange([newProj, ...projects]);
    addActivity("created project", name.trim(), "project");
    addToast("success", `Project "${name.trim()}" created.`);
    setName("");
    setDescription("");
    setShowForm(false);
  };

  const remove = (projectId: string, pName: string) => {
    if (!confirm(`Delete project "${pName}"?`)) return;
    onChange(projects.filter((p) => p._id !== projectId));
    addActivity("deleted project", pName, "project");
    addToast("info", `Project "${pName}" removed.`);
  };

  return (
    <div>
      <PanelToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search projects by name..."
        count={filtered.length}
        total={projects.length}
        action={
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onChange={setView} />
            {canManage && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-xs transition hover:bg-[#0F2D29]/90"
              >
                <Plus size={14} />
                New Project
              </button>
            )}
          </div>
        }
      />

      {/* New Project Form */}
      {canManage && showForm && (
        <form
          onSubmit={create}
          className="mb-6 space-y-3.5 rounded-xl border border-[#8FE3C4]/40 bg-gradient-to-br from-[#8FE3C4]/10 to-transparent p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#0F2D29]">
              <FolderKanban size={15} className="text-[#0F8A65]" />
              Create New Project
            </p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[#8FA69E] hover:text-[#0F2D29]"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project title (e.g. Mobile App v3)"
                className={inputClass}
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={inputClass}
            >
              <option value="in-progress">In Progress</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief project goal or summary..."
            rows={2}
            className={`${inputClass} resize-none`}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl px-3.5 py-1.5 text-[12.5px] font-medium text-[#5B6E68]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-xl bg-[#0F2D29] px-4 py-1.5 text-[12.5px] font-medium text-white shadow-xs disabled:opacity-40"
            >
              Add Project
            </button>
          </div>
        </form>
      )}

      {/* Projects List/Grid */}
      {projects.length === 0 ? (
        <PanelEmpty
          icon={FolderKanban}
          title="No projects in this workspace"
          hint="Create your first project to start tracking tasks and milestone progress."
          action={
            canManage ? (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0F2D29] px-4 py-2 text-[12.5px] font-medium text-white"
              >
                <Plus size={14} />
                Create First Project
              </button>
            ) : undefined
          }
        />
      ) : filtered.length === 0 ? (
        <NoResults query={search} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((p) => {
            const StatusIcon = PROJECT_STATUS_META[p.status].icon;
            const pct = p.taskCount > 0 ? Math.round((p.completedTaskCount / p.taskCount) * 100) : 0;
            return (
              <article
                key={p._id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#0F2D29]/10 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8FE3C4]/60 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8FE3C4]/20 text-[#0F8A65] ring-1 ring-[#8FE3C4]/30">
                        <FolderKanban size={18} />
                      </div>
                      <div>
                        <h3
                          onClick={() => onSelectProject(p)}
                          className="cursor-pointer text-[14.5px] font-bold text-[#0F2D29] hover:underline"
                        >
                          {p.name}
                        </h3>
                        <span
                          className={`mt-0.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${PROJECT_STATUS_META[p.status].badge
                            }`}
                        >
                          <StatusIcon size={10} />
                          {PROJECT_STATUS_META[p.status].label}
                        </span>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => remove(p._id, p.name)}
                        className="rounded-lg p-1.5 text-[#8FA69E] opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-[#5B6E68]">
                    {p.description || "No description specified for this project."}
                  </p>
                </div>

                <div className="mt-5 border-t border-[#0F2D29]/6 pt-3.5">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="font-medium text-[#5B6E68]">
                      Progress ({p.completedTaskCount}/{p.taskCount} tasks)
                    </span>
                    <span className="font-bold text-[#0F2D29]">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#0F2D29]/8">
                    <div
                      className="h-full bg-[#0F8A65] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-1">
                    <span className="text-[10.5px] text-[#8FA69E]">
                      Updated {p.updatedAt}
                    </span>
                    <button
                      onClick={() => onSelectProject(p)}
                      className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#0F8A65] hover:underline"
                    >
                      View details
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#0F2D29]/10 bg-white">
          <ul className="divide-y divide-[#0F2D29]/6">
            {filtered.map((p) => {
              const StatusIcon = PROJECT_STATUS_META[p.status].icon;
              return (
                <li
                  key={p._id}
                  className="group flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[#0F2D29]/2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8FE3C4]/20 text-[#0F8A65]">
                      <FolderKanban size={16} />
                    </div>
                    <div className="min-w-0">
                      <p
                        onClick={() => onSelectProject(p)}
                        className="cursor-pointer truncate text-[13.5px] font-bold text-[#0F2D29] hover:underline"
                      >
                        {p.name}
                      </p>
                      <p className="truncate text-[11.5px] text-[#8FA69E]">
                        {p.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${PROJECT_STATUS_META[p.status].badge
                        }`}
                    >
                      <StatusIcon size={10} />
                      {PROJECT_STATUS_META[p.status].label}
                    </span>

                    <span className="text-[11.5px] text-[#5B6E68]">
                      {p.completedTaskCount}/{p.taskCount} tasks
                    </span>

                    {canManage && (
                      <button
                        onClick={() => remove(p._id, p.name)}
                        className="rounded-lg p-1.5 text-[#8FA69E] opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
