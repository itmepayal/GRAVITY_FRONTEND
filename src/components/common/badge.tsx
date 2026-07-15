import { Reveal } from "./reveal";

interface BadgeProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  dark?: boolean;
}

export const Badge = ({
  eyebrow,
  title,
  description,
  dark = false,
}: BadgeProps) => {
  return (
    <Reveal>
      <div className="max-w-[580px] mx-auto text-center px-4 sm:px-6 mb-10">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold mb-2.5 sm:mb-3 px-2 sm:px-2.5 py-[3px] sm:py-1 rounded-md uppercase tracking-wide ${
            dark
              ? "text-[#8FE3C4] bg-white/5"
              : "text-[#3FA787] bg-[#3FA787]/10"
          }`}
        >
          {eyebrow}
        </span>

        <h2
          className={`font-bold tracking-tight mb-3 sm:mb-3.5 leading-[1.15] text-[clamp(1.5rem,4.5vw+0.5rem,2.125rem)] ${
            dark ? "text-white" : "text-[#0F2D29]"
          }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`text-[clamp(0.875rem,1.5vw+0.5rem,0.9375rem)] leading-relaxed ${
              dark ? "text-[#B7CFC7]" : "text-[#5E6D68]"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </Reveal>
  );
};