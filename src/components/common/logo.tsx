import type { GravityMarkProps } from "@/types";

export const GravityMark = ({ size = 28, className = "" }: GravityMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={`shrink-0 ${className}`}
  >
    {/* Dark Emerald Container Background */}
    <rect width="40" height="40" fill="#0F2D29" />
    <rect
      x="0.5"
      y="0.5"
      width="39"
      height="39"
      stroke="#8FE3C4"
      strokeOpacity="0.25"
      strokeWidth="1"
    />

    {/* Orbital Gravity Ring Accent */}
    <circle
      cx="20"
      cy="20"
      r="13"
      stroke="#8FE3C4"
      strokeOpacity="0.2"
      strokeWidth="1.5"
      strokeDasharray="4 3"
    />

    {/* Dynamic 'G' Ascending Anti-Gravity Curve */}
    <path
      d="M11 25.5C11 18.5 15.5 12 22.5 12C26 12 28.5 13.5 30 15.5"
      stroke="url(#gravity-grad-1)"
      strokeWidth="2.75"
      strokeLinecap="round"
    />
    <path
      d="M30 15.5L30 22C30 25.5 27 28 23.5 28C19 28 17 25 17 22H27"
      stroke="#8FE3C4"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Ascending Nodes */}
    <circle cx="11" cy="25.5" r="2" fill="#8FE3C4" />
    <circle cx="22.5" cy="12" r="2" fill="#8FE3C4" />
    <circle cx="30" cy="15.5" r="2.5" fill="#FFFFFF" stroke="#8FE3C4" strokeWidth="1.5" />
    <circle cx="27" cy="22" r="2" fill="#8FE3C4" />

    {/* Gradient Definitions */}
    <defs>
      <linearGradient
        id="gravity-grad-1"
        x1="11"
        y1="25.5"
        x2="30"
        y2="15.5"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8FE3C4" stopOpacity="0.4" />
        <stop offset="1" stopColor="#8FE3C4" />
      </linearGradient>
    </defs>
  </svg>
);

export const GravityMarkLoader = ({ step }: { step: number }) => {
  const nodes = [
    { cx: 6, cy: 19 },
    { cx: 12.5, cy: 12.5 },
    { cx: 17, cy: 16 },
    { cx: 22, cy: 9 },
  ];
  const progress = Math.min(step, 4) / 4;
  return (
    <div className="relative w-[76px] h-[76px] flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_#8FE3C433_0%,_transparent_68%)] animate-[mark-breathe_2.6s_ease-in-out_infinite]" />
      <svg width="52" height="52" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="relative">
        <rect width="28" height="28" className="fill-[#8FE3C4]" opacity={0.1} />
        <rect
          width="27"
          height="27"
          x="0.5"
          y="0.5"
          className="stroke-[#8FE3C4]"
          strokeOpacity={0.18}
          fill="none"
        />
        <path
          d="M6 19 L12.5 12.5 L17 16 L22 9"
          className="stroke-[#8FE3C4] transition-[stroke-dashoffset] duration-500 ease-out"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="26"
          strokeDashoffset={26 - progress * 26}
        />
        {progress > 0 && progress < 1 && (
          <circle r="1.3" className="fill-white">
            <animateMotion
              dur="0.5s"
              repeatCount="1"
              path="M6 19 L12.5 12.5 L17 16 L22 9"
              keyPoints={`${Math.max(0, progress - 0.25)};${progress}`}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        )}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r={i === 3 ? 2.4 : 1.9}
            className={`transition-[fill,r] duration-300 ease-out ${
              step > i ? "fill-[#8FE3C4]" : "fill-[#B7CFC7]/25"
            }`}
          />
        ))}
      </svg>
    </div>
  );
};

export default GravityMark;
