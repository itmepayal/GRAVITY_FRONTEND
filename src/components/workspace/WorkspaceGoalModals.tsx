import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Target, X, Loader2 } from "lucide-react";
import { useCreateGoal } from "@/hooks/mutations/goal/use-create-goal";
import { useUpdateGoal } from "@/hooks/mutations/goal/use-update-goal";
import { useDeleteGoal } from "@/hooks/mutations/goal/use-delete-goal";
import type { GoalStatus } from "@/types/goal";

export type { GoalStatus };

export interface GoalOption {
  id: string;
  title: string;
  description?: string;
  status?: GoalStatus;
  progress?: number;
  targetDate?: string;
}

export const GOAL_STATUS_META: Record<
  GoalStatus,
  { label: string; color: string; bg: string }
> = {
  planning: { label: "Planning", color: "#5B6E68", bg: "rgba(91, 110, 104, 0.1)" },
  active: { label: "Active", color: "#0F8A65", bg: "rgba(15, 138, 101, 0.1)" },
  on_hold: { label: "On Hold", color: "#D97706", bg: "rgba(217, 119, 6, 0.1)" },
  completed: { label: "Completed", color: "#2563EB", bg: "rgba(37, 99, 235, 0.1)" },
  cancelled: { label: "Cancelled", color: "#DC2626", bg: "rgba(220, 38, 38, 0.1)" },
  archived: { label: "Archived", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" },
};

export const GOAL_STATUS_OPTIONS = (Object.keys(GOAL_STATUS_META) as GoalStatus[]).map(
  (value) => ({ value, label: GOAL_STATUS_META[value].label })
);

export const formatGoalDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

export const CreateGoalModal = ({
  workspaceId,
  workspaceName,
  onClose,
}: {
  workspaceId: string;
  workspaceName: string;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<GoalStatus>("planning");
  const [targetDate, setTargetDate] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useCreateGoal();
  const queryClient = useQueryClient();

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setFormError("Goal title must be at least 2 characters.");
      return;
    }

    mutate(
      {
        workspaceId,
        data: {
          name: trimmedTitle,
          description: description.trim() || undefined,
          status,
          endDate: targetDate || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["goals", workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["workspace-goals"] });
          onClose();
        },
        onError: () => {
          setFormError("Couldn't create goal.");
        },
      }
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden border border-[#0F2D29] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 bg-[#0F2D29] p-6 text-white sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#8FE3C4]/30 bg-[#8FE3C4]/20 text-[#8FE3C4]">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-bold font-['Goldman',sans-serif] text-white">New Goal</h2>
              <p className="text-[12px] text-[#B7CFC7]">Set a goal for <span className="font-semibold text-white">{workspaceName}</span></p>
            </div>
          </div>
          <button onClick={onClose} disabled={isPending} className="text-[#B7CFC7] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 px-6 pb-6 sm:px-7 sm:pb-7">
          {formError && <div className="p-3 bg-red-50 text-red-600 text-[12px] font-semibold">{formError}</div>}
          <div>
            <label className="mb-2 block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase">Goal Title *</label>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Expand API bandwidth by 40%"
              className="w-full border border-[#0F2D29]/15 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-bold text-[#0F2D29] font-['Goldman',sans-serif] uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Target objectives..."
              className="w-full border border-[#0F2D29]/15 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-[#5B6E68]">Cancel</button>
            <button type="submit" disabled={isPending} className="bg-[#0F2D29] text-white px-5 py-2 text-[13px] font-bold font-['Goldman',sans-serif]">
              {isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export const EditGoalModal = ({
  goal,
  workspaceId,
  workspaceName,
  onClose,
}: {
  goal: GoalOption;
  workspaceId: string;
  workspaceName?: string;
  onClose: () => void;
}) => {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? "");
  const [status, setStatus] = useState<GoalStatus>(goal.status ?? "planning");
  const [targetDate, setTargetDate] = useState(toDateInputValue(goal.targetDate));
  const { mutate, isPending } = useUpdateGoal();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      {
        goalId: goal.id,
        data: {
          name: title.trim(),
          description: description.trim() || undefined,
          status,
          endDate: targetDate || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["goals", workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["workspace-goals"] });
          onClose();
        },
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl">
        <div className="bg-[#0F2D29] p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold font-['Goldman',sans-serif]">Edit Goal</h2>
            <button onClick={onClose} className="text-[#B7CFC7] hover:text-white"><X size={18} /></button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#0F2D29] uppercase">Goal Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-[#0F2D29]/15 p-2.5 text-[13px] font-semibold" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[#0F2D29]/10">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-[#5B6E68]">Cancel</button>
            <button type="submit" disabled={isPending} className="bg-[#0F2D29] text-white px-5 py-2 text-[13px] font-bold font-['Goldman',sans-serif]">Update Goal</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export const DeleteGoalModal = ({
  goal,
  onClose,
}: {
  goal: GoalOption;
  onClose: () => void;
}) => {
  const [confirmText, setConfirmText] = useState("");
  const { mutate, isPending } = useDeleteGoal();
  const queryClient = useQueryClient();
  const isMatch = confirmText.trim().toLowerCase() === goal.title.trim().toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || isPending) return;
    mutate(goal.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workspace-goals"] });
        onClose();
      },
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2D29]/50 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm border border-[#0F2D29] bg-white p-6 shadow-2xl">
        <h3 className="text-[17px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">Delete Goal</h3>
        <p className="mt-2 text-[13px] text-[#5B6E68]">Type <span className="font-bold text-red-600">{goal.title}</span> to confirm.</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full border border-[#0F2D29]/15 p-2.5 text-[13px] font-semibold" />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-[#5B6E68]">Cancel</button>
            <button type="submit" disabled={!isMatch || isPending} className="bg-red-600 text-white px-5 py-2 text-[13px] font-bold font-['Goldman',sans-serif]">Delete</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
