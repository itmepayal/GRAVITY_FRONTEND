import { useMemo, useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import {
  MOCK_TASKS,
  STATUS_STYLES,
  type TaskStatus,
} from "@/constants/dashboard";

const FILTERS: { key: TaskStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "blocked", label: "Blocked" },
  { key: "pending", label: "Pending" },
  { key: "done", label: "Done" },
];

export default function MyTasks() {
  const { openMobileNav } = useDashboardContext();
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const tasks = useMemo(
    () =>
      filter === "all"
        ? MOCK_TASKS
        : MOCK_TASKS.filter((t) => t.status === filter),
    [filter],
  );

  return (
    <>
      <Topbar
        title="My Tasks"
        subtitle={`${MOCK_TASKS.length} tasks across your active projects`}
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-[#0F2D29]/8 rounded-xl p-1">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
                  filter === key
                    ? "bg-[#0F2D29] text-white"
                    : "text-[#5B6E68] hover:text-[#0F2D29]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 bg-[#0F2D29] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#0F2D29]/90 transition-colors">
            <Plus size={15} />
            New task
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#0F2D29]/8 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[1fr_140px_120px_120px] gap-4 px-5 py-3 border-b border-[#0F2D29]/8 text-[11px] uppercase tracking-[0.04em] text-[#8FA69E] font-medium">
            <span>Task</span>
            <span>Project</span>
            <span>Status</span>
            <span>Due</span>
          </div>

          {tasks.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-[#0F2D29] text-[14px] font-medium">
                Nothing here right now
              </p>
              <p className="text-[#5B6E68] text-[12.5px] mt-1">
                Tasks matching this filter will show up as they're created.
              </p>
            </div>
          ) : (
            tasks.map((task) => {
              const s = STATUS_STYLES[task.status];
              return (
                <div
                  key={task.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px_120px] gap-2 sm:gap-4 items-center px-5 py-3.5 border-b border-[#0F2D29]/6 last:border-b-0 hover:bg-[#0F2D29]/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9.5px] font-semibold text-[#0F2D29]"
                      style={{ backgroundColor: task.assignee.color }}
                      title={task.assignee.name}
                    >
                      {task.assignee.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <span className="text-[#0F2D29] text-[13.5px] font-medium truncate">
                      {task.title}
                    </span>
                  </div>
                  <span className="text-[#5B6E68] text-[12.5px]">
                    {task.project}
                  </span>
                  <span
                    className={`inline-flex w-fit items-center gap-1.5 text-[11.5px] font-medium px-2 py-1 rounded-full ${s.bg} ${s.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#5B6E68] text-[12.5px]">
                    <Calendar size={12.5} />
                    {task.due}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
