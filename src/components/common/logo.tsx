import type { GravityMarkProps } from "@/types";

export const GravityMark = ({ size = 22, className = "" }: GravityMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    className={`shrink-0 ${className}`}
  >
    <rect width="32" height="32" rx="8" fill="#0F2D29" />
    <path
      d="M7 22.5 L13.5 14.5 L19 18 L25 8.5"
      stroke="#8FE3C4"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="7"
      cy="22.5"
      r="1.9"
      fill="#0F2D29"
      stroke="#8FE3C4"
      strokeWidth="1.6"
    />
    <circle
      cx="13.5"
      cy="14.5"
      r="1.9"
      fill="#0F2D29"
      stroke="#8FE3C4"
      strokeWidth="1.6"
    />
    <circle
      cx="19"
      cy="18"
      r="1.9"
      fill="#0F2D29"
      stroke="#8FE3C4"
      strokeWidth="1.6"
    />
    <circle cx="25" cy="8.5" r="2.6" fill="#8FE3C4" />
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
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_#8FE3C433_0%,_transparent_68%)] animate-[mark-breathe_2.6s_ease-in-out_infinite]" />
      <svg width="52" height="52" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="relative">
        <rect width="28" height="28" rx="7" className="fill-[#8FE3C4]" opacity={0.1} />
        <rect
          width="27"
          height="27"
          x="0.5"
          y="0.5"
          rx="6.5"
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
            } ${step > i && i === 3 ? "drop-shadow-[0_0_3px_#8FE3C4]" : ""}`}
          />
        ))}
      </svg>
    </div>
  );
}

export default GravityMark;

