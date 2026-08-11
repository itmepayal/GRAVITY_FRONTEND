import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Kanban,
  Zap,
  Shield,
  LayoutGrid,
} from "lucide-react";
import { Highlight } from "@/components/common/highlight";
import { DependencyGraph } from "@/components/common/graph";
import {
  LANDING_BOARD,
  LANDING_PROJECT,
} from "@/constants/task/landingData";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#0F2D29] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-[220px] w-[220px] opacity-25 blur-3xl sm:-top-32 sm:-right-32 sm:h-[380px] sm:w-[380px] lg:-top-40 lg:-right-40 lg:h-[520px] lg:w-[520px]"
        style={{
          background: "radial-gradient(circle, #8FE3C4 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-[200px] w-[200px] opacity-15 blur-3xl sm:h-[320px] sm:w-[320px]"
        style={{
          background: "radial-gradient(circle, #E98A57 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-18 md:px-8 lg:px-12 lg:py-22 xl:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 border border-[#8FE3C4]/25 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#8FE3C4] sm:text-[12px]">
              <span className="h-2 w-2 shrink-0 animate-pulse bg-[#8FE3C4]" />
              Gravity TMS — Enterprise Task Management
            </div>

            <h1 className="text-[28px] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[40px] md:text-[48px] lg:text-[52px]">
              Plan, assign & ship tasks on your{" "}
              <Highlight>
                <span className="capitalize">critical path</span>
              </Highlight>
            </h1>

            <p className="mx-auto max-w-[540px] text-sm font-normal leading-relaxed text-[#B7CFC7] sm:text-base lg:mx-0">
              Kanban boards, sprint tracking, subtasks, and dependency graphs —
              all in one workspace. {LANDING_PROJECT.name} is{" "}
              {LANDING_PROJECT.progress}% complete with real-time capacity
              planning built in.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1 lg:justify-start">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 bg-[#8FE3C4] px-6 py-3.5 text-[14px] font-extrabold tracking-wide text-[#0F2D29] shadow-[0_8px_24px_rgba(143,227,196,0.25)] transition hover:bg-white"
              >
                Go to Dashboard
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link
                to="/dashboard/tasks"
                className="flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-3.5 text-[14px] font-bold text-white transition hover:bg-white/20"
              >
                <Kanban size={16} />
                Open Kanban Board
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-[12px] font-semibold text-[#B7CFC7] lg:justify-start">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#8FE3C4]" />
                {LANDING_BOARD.columns.length} workflow columns
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={15} className="text-[#8FE3C4]" />
                Workspace RBAC security
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={15} className="text-[#8FE3C4]" />
                Live task sync
              </span>
            </div>
          </div>

          <div className="relative w-full border border-[#8FE3C4]/20 bg-[#0F2D29]/90 p-2 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
            <div className="mb-2 flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2.5">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#8FE3C4]">
                <LayoutGrid size={14} />
                {LANDING_BOARD.name}
              </span>
              <span className="bg-[#8FE3C4] px-2 py-0.5 text-[10px] font-extrabold text-[#0F2D29]">
                LIVE SYNC
              </span>
            </div>
            <div className="mb-2 flex gap-1 px-1">
              {LANDING_BOARD.columns.slice(0, 5).map((col) => (
                <span
                  key={col}
                  className="flex-1 truncate border border-white/8 bg-white/5 px-1.5 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-[#B7CFC7]"
                >
                  {col}
                </span>
              ))}
            </div>
            <DependencyGraph />
          </div>
        </div>
      </div>
    </section>
  );
};
