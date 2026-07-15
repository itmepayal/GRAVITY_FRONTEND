import { AMBIENT_NODES } from "@/constants/loader";
import { GravityMarkLoader } from "@/components/common/logo";
import { Pill } from "@/components/common/pill";

export default function NotFound() {
  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0F2D29]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:28px_28px]" />

      <div className="pointer-events-none absolute -top-24 -right-24 sm:-top-40 sm:-right-40 w-[320px] h-[320px] sm:w-[520px] sm:h-[520px] rounded-full opacity-20 blur-3xl bg-[radial-gradient(circle,_#8FE3C4_0%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 sm:-bottom-40 sm:-left-40 w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] rounded-full opacity-10 blur-3xl bg-[radial-gradient(circle,_#E98A57_0%,_transparent_70%)]" />

      {AMBIENT_NODES.map((n, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute rounded-full opacity-35 animate-[node-drift_ease-in-out_infinite] ${
            i % 3 === 0 ? "bg-[#E98A57]" : "bg-[#8FE3C4]"
          }`}
          style={{
            left: n.x,
            top: n.y,
            width: n.size,
            height: n.size,
            animationDuration: n.dur,
            animationDelay: n.delay,
          }}
        />
      ))}

      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <GravityMarkLoader step={2} />

        <span className="text-white text-[19px] sm:text-[21px] font-semibold font-['Poppins',sans-serif] tracking-[-0.01em] [text-shadow:0_0_24px_#8FE3C422]">
          Gravity
        </span>

        <div className="flex flex-col items-center gap-3">
          <span className="text-white font-bold leading-none text-[72px] sm:text-[96px] font-['Poppins',sans-serif] tracking-[-0.02em] [text-shadow:0_0_40px_#8FE3C433]">
            404
          </span>
          <h1 className="text-white text-[17px] sm:text-[19px] font-semibold font-['Poppins',sans-serif] tracking-[-0.01em]">
            This page drifted off schedule
          </h1>
          <p className="text-[#B7CFC7] text-[13px] sm:text-[13.5px] font-['JetBrains_Mono','Poppins',monospace] font-medium tracking-[0.02em] max-w-[320px] sm:max-w-[380px]">
            The link may be broken, moved, or never existed on this timeline.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <a href="/" onClick={(e) => { e.preventDefault(); goHome(); }}>
            <Pill icon>Back to Home</Pill>
          </a>
          <Pill variant="outline" dark>
            Report an issue
          </Pill>
        </div>

        <div className="w-[190px] sm:w-[230px] h-[4px] rounded-full bg-white/[0.07] overflow-hidden relative shadow-[0_0_12px_#8FE3C41A] mt-4">
          <div className="absolute inset-y-0 left-0 rounded-full w-2/5 animate-[loader-sweep_1.5s_ease-in-out_infinite] bg-[linear-gradient(90deg,_transparent,_#8FE3C4,_#3FA787,_transparent)]" />
        </div>
      </div>
    </div>
  );
}