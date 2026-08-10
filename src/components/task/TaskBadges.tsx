import React from "react";
import { type TaskPriority, type TaskStatus, PRIORITY_META, STATUS_META } from "@/types/task";

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
  const meta = PRIORITY_META[priority];
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide border border-[#0F2D29]/10"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {meta.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide border border-[#0F2D29]/10"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {meta.label}
    </span>
  );
};
