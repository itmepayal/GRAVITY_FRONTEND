import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Kanban, Zap, Shield, LayoutGrid } from "lucide-react";
import { Highlight } from "@/components/common/highlight";
import { DependencyGraph } from "@/components/common/graph";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#0F2D29] text-white">
      {/* Background Dot Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 sm:-top-32 sm:-right-32 lg:-top-40 lg:-right-40 w-[220px] h-[220px] sm:w-[380px] sm:h-[380px] lg:w-[520px] lg:h-[520px] rounded-none opacity-25 blur-3xl"
        style={{
          background: "radial-gradient(circle, #8FE3C4 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 sm:gap-12 lg:gap-16 items-center relative">

          {/* Left Hero Text Column */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-bold text-[#8FE3C4] bg-white/5 border border-[#8FE3C4]/20 px-3.5 py-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-none bg-[#8FE3C4] animate-pulse shrink-0" />
              Gravity TMS v2.4 — Enterprise Task Management System
            </div>

            <h1 className="text-white text-[28px] sm:text-[40px] md:text-[48px] lg:text-[52px] font-extrabold leading-[1.15] tracking-tight">
              Task Management that finds your{" "}
              <Highlight><span className="capitalize">critical path</span></Highlight> automatically
            </h1>

            <p className="text-[#B7CFC7] text-sm sm:text-base font-['Poppins',sans-serif] max-w-[520px] mx-auto lg:mx-0 leading-relaxed font-normal">
              Plan, track, and ship high-impact work without the manual overhead.
              Gravity TMS automatically calculates task dependencies, resource capacity, and sprint roadmaps in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 bg-[#8FE3C4] text-[#0F2D29] px-6 py-3.5 text-[14px] font-extrabold tracking-wide hover:bg-white transition shadow-lg"
              >
                Go to Dashboard
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>

              <Link
                to="/dashboard/tasks"
                className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-6 py-3.5 text-[14px] font-bold hover:bg-white/20 transition"
              >
                <Kanban size={16} />
                Explore Kanban Boards
              </Link>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-4 text-[12px] font-semibold text-[#B7CFC7]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#8FE3C4]" />
                Zero setup friction
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={15} className="text-[#8FE3C4]" />
                Enterprise RBAC Security
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={15} className="text-[#8FE3C4]" />
                Real-time Automation
              </span>
            </div>
          </div>

          {/* Right Interactive Graph / Kanban Preview */}
          <div className="relative w-full overflow-hidden border border-[#8FE3C4]/20 bg-[#0F2D29]/80 p-2 shadow-2xl">
            <div className="mb-2 flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8FE3C4]">
              <span className="flex items-center gap-1.5">
                <LayoutGrid size={14} /> Active Sprint Pipeline
              </span>
              <span className="bg-[#8FE3C4] text-[#0F2D29] px-2 py-0.5 text-[10px] font-extrabold">
                LIVE SYNC
              </span>
            </div>
            <DependencyGraph />
          </div>

        </div>
      </div>
    </section>
  );
};