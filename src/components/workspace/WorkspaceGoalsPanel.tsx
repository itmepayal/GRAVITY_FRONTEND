import { useState, useMemo } from "react";
import { Target, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useGetWorkspaceGoals } from "@/hooks/queries/goal/get-workspace-goals";
import {
  type GoalOption,
  GOAL_STATUS_META,
  formatGoalDate,
  CreateGoalModal,
  EditGoalModal,
  DeleteGoalModal,
} from "./WorkspaceGoalModals";

export const normalizeGoalOption = (raw: any): GoalOption => ({
  id: raw._id ?? raw.id,
  title: raw.name ?? raw.title ?? "Untitled Goal",
  description: raw.description ?? "",
  status: raw.status ?? "planning",
  progress: raw.progress,
  targetDate: raw.endDate ?? raw.targetDate,
});

export const WorkspaceGoalsPanel = ({
  workspaceId,
  workspaceName,
  canManage,
}: {
  workspaceId: string;
  workspaceName: string;
  canManage: boolean;
}) => {
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalOption | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalOption | null>(null);

  const { data: goalsResponse, isLoading: isLoadingGoals } =
    useGetWorkspaceGoals(workspaceId);

  const goals: GoalOption[] = useMemo(() => {
    const res: any = goalsResponse;
    const raw = Array.isArray(res) ? res : (res?.goals ?? res?.data ?? []);
    return raw.map(normalizeGoalOption);
  }, [goalsResponse]);

  return (
    <div className="border border-[#0F2D29]/12 bg-white p-6 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-[#0F2D29]/10 pb-4">
        <h3 className="text-[17px] font-bold font-['Goldman',sans-serif] text-[#0F2D29] flex items-center gap-2.5">
          <Target size={20} className="text-[#0F2D29]" />
          Workspace Goals ({goals.length})
        </h3>
        {canManage && (
          <button
            onClick={() => setIsCreateGoalOpen(true)}
            className="flex items-center gap-2 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
          >
            <Plus size={15} strokeWidth={2.5} />
            New Goal
          </button>
        )}
      </div>

      {isLoadingGoals ? (
        <div className="flex items-center justify-center gap-2 py-12">
          <Loader2 size={20} className="animate-spin text-[#0F2D29]" />
          <span className="text-[13px] font-semibold text-[#5B6E68]">
            Loading goals...
          </span>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-[#0F2D29]/3 py-12 px-6 text-center">
          <Target size={32} className="text-[#0F2D29]/40 mb-3" />
          <p className="text-[15px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
            No Goals Defined Yet
          </p>
          <p className="mt-1 text-[12.5px] text-[#5B6E68] max-w-sm">
            Set quarterly objectives and delivery targets for {workspaceName}.
          </p>
          {canManage && (
            <button
              onClick={() => setIsCreateGoalOpen(true)}
              className="mt-4 bg-[#0F2D29] text-white px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif]"
            >
              Add First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const meta = GOAL_STATUS_META[g.status ?? "not_started"];
            return (
              <div
                key={g.id}
                className="flex flex-col justify-between border border-[#0F2D29]/15 bg-white p-5 hover:border-[#0F2D29] transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider"
                      style={{
                        color: meta.color,
                        backgroundColor: meta.bg,
                        borderColor: `${meta.color}40`,
                      }}
                    >
                      {meta.label}
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingGoal(g)}
                          className="p-1 text-[#5B6E68] hover:text-[#0F2D29]"
                          title="Edit Goal"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingGoal(g)}
                          className="p-1 text-[#5B6E68] hover:text-red-600"
                          title="Delete Goal"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <h4 className="text-[15px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">
                    {g.title}
                  </h4>
                  {g.description && (
                    <p className="mt-1 text-[12.5px] text-[#5B6E68] line-clamp-2">
                      {g.description}
                    </p>
                  )}
                </div>
                {g.targetDate && (
                  <div className="mt-4 pt-3 border-t border-[#0F2D29]/10 text-[11.5px] font-semibold text-[#5B6E68]">
                    Target: {formatGoalDate(g.targetDate)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isCreateGoalOpen && (
        <CreateGoalModal
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          onClose={() => setIsCreateGoalOpen(false)}
        />
      )}

      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          onClose={() => setEditingGoal(null)}
        />
      )}

      {deletingGoal && (
        <DeleteGoalModal
          goal={deletingGoal}
          onClose={() => setDeletingGoal(null)}
        />
      )}
    </div>
  );
};
