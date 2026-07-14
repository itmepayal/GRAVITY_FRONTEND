import React, { useEffect, useRef, useState } from "react";
import { GitBranch, Clock, Users, Workflow } from "lucide-react";

/* ---------------------------------------------------------
   Font styles (match existing design system)
--------------------------------------------------------- */
const fontDisplay: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  letterSpacing: "-0.01em",
};
const fontMono: React.CSSProperties = {
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 500,
};

/* ---------------------------------------------------------
   Types
--------------------------------------------------------- */
interface Stat {
  value: string;
  label: string;
}

/* ---------------------------------------------------------
   Reveal-on-scroll hook (self-contained, no external dep)
--------------------------------------------------------- */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, shown };
}

/* ---------------------------------------------------------
   Count-up animation hook (self-contained, no external dep)
--------------------------------------------------------- */
function useCountUp(value: string, shouldRun: boolean, duration = 1400) {
  const [display, setDisplay] = useState(
    value.replace(/[0-9.]/g, (c) => (c === "." ? "" : "0")),
  );
  const ran = useRef(false);
  useEffect(() => {
    if (!shouldRun || ran.current) return;
    ran.current = true;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const match = value.match(/^([^0-9]*)([0-9,]*\.?[0-9]*)(.*)$/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const [, prefix, numRaw, suffix] = match;
    const target = parseFloat(numRaw.replace(/,/g, ""));
    if (!isFinite(target)) {
      setDisplay(value);
      return;
    }
    const decimals = numRaw.includes(".") ? numRaw.split(".")[1].length : 0;
    const useCommas = numRaw.includes(",");
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      const formatted = useCommas
        ? Math.round(current).toLocaleString("en-US")
        : current.toFixed(decimals);
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldRun, value, duration]);
  return display;
}

/* ---------------------------------------------------------
   Data — swap with your real stats
--------------------------------------------------------- */
const STATS: Stat[] = [
  { value: "3.2M", label: "Dependencies tracked" },
  { value: "41%", label: "Fewer schedule slips" },
  { value: "12,400", label: "Teams onboarded" },
  { value: "98.7%", label: "Uptime, last 12 months" },
];

const STAT_ICONS: React.ElementType[] = [GitBranch, Clock, Users, Workflow];

/* ---------------------------------------------------------
   STATS BAR — bordered icon-card grid, fully responsive
--------------------------------------------------------- */
export function StatsBar() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section className="bg-[#F7F4EC] py-14 sm:py-16 md:py-20 px-5 sm:px-6 lg:px-40">
      <div className="max-w-[1400px] mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
        >
          {STATS.map((s, i) => (
            <StatCardAlt
              key={s.label}
              stat={s}
              icon={STAT_ICONS[i % STAT_ICONS.length]}
              shown={shown}
              delay={i * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCardAlt({
  stat,
  icon: Icon,
  shown,
  delay,
}: {
  stat: Stat;
  icon: React.ElementType;
  shown: boolean;
  delay: number;
}) {
  const display = useCountUp(stat.value, shown);
  return (
    <div
      className="bg-white rounded-2xl border border-[#0F2D29]/8 p-4 sm:p-5 md:p-6 flex flex-col gap-2.5 sm:gap-3 md:gap-4 hover:border-[#3FA787]/30 hover:shadow-[0_10px_30px_rgba(15,45,41,0.06)] transition-all duration-200 min-w-0"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg bg-[#3FA787]/10 flex items-center justify-center shrink-0">
        <Icon size={15} color="#3FA787" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div
          className="text-[19px] xs:text-[22px] sm:text-[26px] md:text-[32px] font-bold text-[#0F2D29] mb-0.5 sm:mb-1 leading-none truncate"
          style={fontDisplay}
          title={display}
        >
          {display}
        </div>
        <div
          className="text-[10.5px] sm:text-[11.5px] md:text-[12.5px] text-[#5E6D68] leading-snug"
          style={fontMono}
        >
          {stat.label}
        </div>
      </div>
    </div>
  );
}
