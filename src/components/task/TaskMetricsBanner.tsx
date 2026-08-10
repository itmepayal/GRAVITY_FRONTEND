import React from "react";
import { CheckCircle2, PlayCircle, Flame, Timer } from "lucide-react";

export interface TaskMetricsProps {
  metrics: {
    total: number;
    completed: number;
    inProgress: number;
    blocked: number;
    urgent: number;
    totalEst: number;
    totalAct: number;
  };
}

export const TaskMetricsBanner: React.FC<TaskMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Stat 1: Total Tasks & Completion */}
      <div className="border border-[#0F2D29]/12 bg-white p-5 shadow-[0_2px_12px_rgba(15,45,41,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">Total Tasks</p>
            <h3 className="mt-1 text-[26px] font-extrabold text-[#0F2D29]">{metrics.total}</h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center bg-[#0F2D29]/10 text-[#0F2D29]">
            <CheckCircle2 size={22} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11.5px] font-semibold text-[#5B6E68]">
          <span>Completed Ratio</span>
          <span className="font-bold text-[#0F2D29]">
            {metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden bg-[#0F2D29]/8">
          <div
            className="h-full bg-[#0F2D29] transition-all duration-300"
            style={{ width: `${metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Stat 2: Active Work */}
      <div className="border border-[#0F2D29]/12 bg-white p-5 shadow-[0_2px_12px_rgba(15,45,41,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">In Active Progress</p>
            <h3 className="mt-1 text-[26px] font-extrabold text-[#0F2D29]">{metrics.inProgress}</h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center bg-[#0F2D29]/10 text-[#0F2D29]">
            <PlayCircle size={22} />
          </div>
        </div>
        <p className="mt-4 text-[11.5px] font-medium text-[#5B6E68]">
          Active engineering & review cycles
        </p>
      </div>

      {/* Stat 3: Blocked & Urgent Alerts */}
      <div className="border border-[#0F2D29]/12 bg-white p-5 shadow-[0_2px_12px_rgba(15,45,41,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">Urgent / Blocked</p>
            <h3 className="mt-1 text-[26px] font-extrabold text-[#0F2D29]">
              {metrics.blocked} <span className="text-[14px] font-semibold text-red-600">/ {metrics.urgent} urgent</span>
            </h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center bg-red-50 text-red-600 border border-red-200">
            <Flame size={22} />
          </div>
        </div>
        <p className="mt-4 text-[11.5px] font-medium text-[#5B6E68]">
          {metrics.blocked > 0 ? "Requires immediate attention!" : "No blocked tasks currently"}
        </p>
      </div>

      {/* Stat 4: Work Hours Tracker */}
      <div className="border border-[#0F2D29]/12 bg-white p-5 shadow-[0_2px_12px_rgba(15,45,41,0.04)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#5B6E68]">Work Hours Logged</p>
            <h3 className="mt-1 text-[26px] font-extrabold text-[#0F2D29]">
              {metrics.totalAct}h <span className="text-[14px] font-semibold text-[#5B6E68]">/ {metrics.totalEst}h est</span>
            </h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center bg-[#0F2D29]/10 text-[#0F2D29]">
            <Timer size={22} />
          </div>
        </div>
        <p className="mt-4 text-[11.5px] font-medium text-[#5B6E68]">
          Logged work metrics across boards
        </p>
      </div>
    </div>
  );
};
