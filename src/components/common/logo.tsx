import type { GravityMarkProps } from "@/types";

const MARK_BG = "#0F2D29";
const MARK_MINT = "#8FE3C4";
const MARK_MUTED = "#B7CFC7";

/** Shared SVG mark — used in navbar, footer, sidebar, and loader */
export const GravityMark = ({
  size = 28,
  className = "",
}: GravityMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`shrink-0 ${className}`}
  >
    <rect width="40" height="40" fill={MARK_BG} />
    <rect
      x="0.5"
      y="0.5"
      width="39"
      height="39"
      stroke={MARK_MINT}
      strokeOpacity="0.25"
      strokeWidth="1"
    />
    <circle
      cx="20"
      cy="20"
      r="13"
      stroke={MARK_MINT}
      strokeOpacity="0.2"
      strokeWidth="1.5"
      strokeDasharray="4 3"
    />
    <path
      d="M11 25.5C11 18.5 15.5 12 22.5 12C26 12 28.5 13.5 30 15.5"
      stroke="url(#gravity-grad-1)"
      strokeWidth="2.75"
      strokeLinecap="round"
    />
    <path
      d="M30 15.5L30 22C30 25.5 27 28 23.5 28C19 28 17 25 17 22H27"
      stroke={MARK_MINT}
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="11" cy="25.5" r="2" fill={MARK_MINT} />
    <circle cx="22.5" cy="12" r="2" fill={MARK_MINT} />
    <circle
      cx="30"
      cy="15.5"
      r="2.5"
      fill="#FFFFFF"
      stroke={MARK_MINT}
      strokeWidth="1.5"
    />
    <circle cx="27" cy="22" r="2" fill={MARK_MINT} />
    <defs>
      <linearGradient
        id="gravity-grad-1"
        x1="11"
        y1="25.5"
        x2="30"
        y2="15.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor={MARK_MINT} stopOpacity="0.4" />
        <stop offset="1" stopColor={MARK_MINT} />
      </linearGradient>
    </defs>
  </svg>
);

/** Animated loader — same mark, orbital ring spin + path reveal */
export const GravityMarkLoader = ({ step }: { step: number }) => {
  const progress = Math.min(step, 4) / 4;
  const nodes = [
    { cx: 11, cy: 25.5, r: 2, active: step >= 1 },
    { cx: 22.5, cy: 12, r: 2, active: step >= 2 },
    { cx: 30, cy: 15.5, r: 2.5, active: step >= 3 },
    { cx: 27, cy: 22, r: 2, active: step >= 4 },
  ];

  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center">
      <div
        className="absolute inset-0 animate-[mark-breathe_2.6s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, rgba(143,227,196,0.22) 0%, transparent 68%)",
        }}
      />
      <svg
        width="72"
        height="72"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="relative"
      >
        <rect width="40" height="40" fill={MARK_BG} />
        <rect
          x="0.5"
          y="0.5"
          width="39"
          height="39"
          stroke={MARK_MINT}
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <circle
          cx="20"
          cy="20"
          r="13"
          stroke={MARK_MINT}
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          className="origin-center animate-[spin_8s_linear_infinite]"
          style={{ transformOrigin: "20px 20px" }}
        />
        <path
          d="M11 25.5C11 18.5 15.5 12 22.5 12C26 12 28.5 13.5 30 15.5"
          stroke={MARK_MINT}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeDasharray="28"
          strokeDashoffset={28 - progress * 28}
          style={{ transition: "stroke-dashoffset 0.45s ease-out" }}
        />
        <path
          d="M30 15.5L30 22C30 25.5 27 28 23.5 28C19 28 17 25 17 22H27"
          stroke={MARK_MINT}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="22"
          strokeDashoffset={22 - Math.max(0, progress - 0.35) * 22 * 2.8}
          style={{ transition: "stroke-dashoffset 0.45s ease-out" }}
        />
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
            fill={n.active ? MARK_MINT : `${MARK_MUTED}40`}
            stroke={n.active ? MARK_MINT : "transparent"}
            strokeWidth={n.r > 2 ? 1.5 : 0}
            style={{ transition: "fill 0.3s ease-out" }}
          />
        ))}
      </svg>
    </div>
  );
};

/** Wordmark row — mark + Gravity TMS (shared by loader & navbar) */
export const GravityBrand = ({
  size = 28,
  showTag = true,
  dark = true,
}: {
  size?: number;
  showTag?: boolean;
  dark?: boolean;
}) => (
  <div className="flex items-center gap-2.5">
    <GravityMark size={size} />
    <div className="flex items-center gap-1.5">
      <span
        className={`text-[19px] font-extrabold tracking-tight sm:text-[21px] ${
          dark ? "text-white" : "text-[#0F2D29]"
        }`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Gravity
      </span>
      {showTag && (
        <span className="border border-[#8FE3C4]/30 bg-[#8FE3C4]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8FE3C4]">
          TMS
        </span>
      )}
    </div>
  </div>
);

export default GravityMark;
