import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Cta = () => {
  return (
    <section className="border-b border-[#0F2D29]/10 bg-[#F8F7F3]">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 sm:py-18 md:px-8 lg:px-12 lg:py-22 xl:px-16">
        <div className="relative overflow-hidden border border-[#0F2D29] bg-[#0F2D29] px-6 py-14 text-center shadow-[0_24px_64px_rgba(15,45,41,0.2)] sm:px-12 sm:py-18">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 opacity-20 blur-3xl"
            style={{
              background: "radial-gradient(circle, #8FE3C4 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 mx-auto max-w-[700px] space-y-6">
            <span className="inline-block border border-[#8FE3C4]/20 bg-white/5 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#8FE3C4]">
              Start with Gravity TMS
            </span>

            <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-[38px] md:text-[44px]">
              Ready to manage tasks, sprints & dependencies in one place?
            </h2>

            <p className="text-sm font-normal leading-relaxed text-[#B7CFC7] sm:text-base">
              Join engineering teams using Gravity TMS to plan sprints, track
              subtasks, unblock dependencies, and ship on schedule.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-[#8FE3C4] px-7 py-3.5 text-[14px] font-extrabold tracking-wide text-[#0F2D29] shadow-[0_8px_24px_rgba(143,227,196,0.25)] transition hover:bg-white"
              >
                Go to Dashboard
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
              <Link
                to="/dashboard/tasks"
                className="flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-3.5 text-[14px] font-bold text-white transition hover:bg-white/20"
              >
                View Kanban Demo
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-[12px] font-semibold text-[#B7CFC7]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#8FE3C4]" />
                Free 14-day trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#8FE3C4]" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#8FE3C4]" />
                Instant workspace setup
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
