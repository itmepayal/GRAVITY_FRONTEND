import { ArchiveRestore, Trash2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { MOCK_ARCHIVED } from "@/constants/dashboard";

export default function Archived() {
  const { openMobileNav } = useDashboardContext();

  return (
    <>
      <Topbar
        title="Archived"
        subtitle={`${MOCK_ARCHIVED.length} completed tasks, kept for reference`}
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {MOCK_ARCHIVED.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#0F2D29]/8 py-16 text-center">
            <p className="text-[#0F2D29] text-[14px] font-medium">
              Nothing archived yet
            </p>
            <p className="text-[#5B6E68] text-[12.5px] mt-1">
              Tasks you archive from My Tasks will show up here.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#0F2D29]/8 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_140px_120px_80px] gap-4 px-5 py-3 border-b border-[#0F2D29]/8 text-[11px] uppercase tracking-[0.04em] text-[#8FA69E] font-medium">
              <span>Task</span>
              <span>Project</span>
              <span>Archived</span>
              <span className="text-right">Actions</span>
            </div>
            {MOCK_ARCHIVED.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px_80px] gap-2 sm:gap-4 items-center px-5 py-3.5 border-b border-[#0F2D29]/6 last:border-b-0 hover:bg-[#0F2D29]/[0.02] transition-colors"
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
                  <span className="text-[#5B6E68] text-[13.5px] font-medium truncate line-through decoration-[#5B6E68]/40">
                    {task.title}
                  </span>
                </div>
                <span className="text-[#5B6E68] text-[12.5px]">
                  {task.project}
                </span>
                <span className="text-[#5B6E68] text-[12.5px]">{task.due}</span>
                <div className="flex items-center gap-1 sm:justify-end">
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-md text-[#5B6E68] hover:bg-[#8FE3C4]/15 hover:text-[#0F8A65] transition-colors"
                    aria-label="Restore task"
                    title="Restore"
                  >
                    <ArchiveRestore size={14} />
                  </button>
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-md text-[#5B6E68] hover:bg-[#E98A57]/15 hover:text-[#B85E2E] transition-colors"
                    aria-label="Delete task"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
