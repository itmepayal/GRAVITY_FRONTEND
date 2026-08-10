import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Cta = () => {
  return (
    <section className="bg-[#F8F7F3] border-b border-[#0F2D29]/10">
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="relative overflow-hidden bg-[#0F2D29] text-center px-6 sm:px-12 py-14 sm:py-18 border border-[#0F2D29] shadow-2xl">
          {/* Dot Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 max-w-[700px] mx-auto space-y-6">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#8FE3C4] bg-white/5 border border-[#8FE3C4]/20 px-3.5 py-1.5">
              Get Started with Gravity TMS
            </span>

            <h2 className="text-white text-[28px] sm:text-[38px] md:text-[44px] font-extrabold leading-tight tracking-tight">
              Ready to transform how your team plans, tracks, and ships work?
            </h2>

            <p className="text-[#B7CFC7] text-sm sm:text-base font-['Poppins',sans-serif] leading-relaxed font-normal">
              Join thousands of high-performing engineering & product teams using Gravity TMS to streamline sprints, unblock dependencies, and hit delivery dates.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-[#8FE3C4] text-[#0F2D29] px-7 py-3.5 text-[14px] font-extrabold tracking-wide hover:bg-white transition shadow-lg"
              >
                Go to Dashboard
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>

              <Link
                to="/dashboard/tasks"
                className="flex items-center gap-2 bg-white/10 text-white border border-white/20 px-6 py-3.5 text-[14px] font-bold hover:bg-white/20 transition"
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