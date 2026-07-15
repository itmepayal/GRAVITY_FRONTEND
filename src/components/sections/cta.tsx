import { Highlight } from "@/components/common/highlight";
import { Pill } from "@/components/common/pill";

export const Cta = () => {
  return (
    <section className="bg-[#F2EADA]">
      <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0F2D29] text-center px-6 sm:px-10 md:px-16 py-14 sm:py-16 md:py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="pointer-events-none absolute -top-24 -right-24 w-[320px] h-[320px] rounded-full bg-[#3FA787]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 w-[280px] h-[280px] rounded-full bg-[#8FE3C4]/10 blur-3xl" />

          <svg
            className="pointer-events-none absolute left-0 bottom-0 w-[140px] sm:w-[190px] md:w-[240px] opacity-70"
            viewBox="0 0 240 240"
            fill="none"
          >
            <rect
              x="30"
              y="120"
              width="90"
              height="90"
              rx="6"
              transform="rotate(45 75 165)"
              fill="url(#diaGrad1)"
              opacity="0.35"
            />
            <rect
              x="-10"
              y="70"
              width="60"
              height="60"
              rx="5"
              transform="rotate(45 20 100)"
              stroke="#8FE3C4"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <rect
              x="70"
              y="180"
              width="40"
              height="40"
              rx="4"
              transform="rotate(45 90 200)"
              fill="#3FA787"
              opacity="0.25"
            />
            <defs>
              <linearGradient id="diaGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8FE3C4" />
                <stop offset="1" stopColor="#3FA787" />
              </linearGradient>
            </defs>
          </svg>

          <svg
            className="pointer-events-none absolute right-0 top-0 w-[130px] sm:w-[170px] md:w-[220px] opacity-70"
            viewBox="0 0 240 240"
            fill="none"
          >
            <rect
              x="120"
              y="10"
              width="80"
              height="80"
              rx="6"
              transform="rotate(45 160 50)"
              fill="url(#diaGrad2)"
              opacity="0.3"
            />
            <rect
              x="180"
              y="70"
              width="50"
              height="50"
              rx="5"
              transform="rotate(45 205 95)"
              stroke="#8FE3C4"
              strokeOpacity="0.35"
              strokeWidth="1.5"
            />
            <defs>
              <linearGradient id="diaGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3FA787" />
                <stop offset="1" stopColor="#8FE3C4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative">
            <h2 className="text-white text-[26px] sm:text-[34px] md:text-[42px] font-bold mb-3 sm:mb-4 leading-tight tracking-tight">
              Put your next launch on a{" "}
              <Highlight>
                <span className="capitalize">real</span>
              </Highlight>{" "}
              schedule
            </h2>

            <p className="text-[#B7CFC7] text-[13.5px] sm:text-[15px] mb-7 sm:mb-8 max-w-[440px] mx-auto">
              Map your first dependency graph in under five minutes. No credit
              card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Pill icon>Get started free</Pill>
              <Pill variant="outline" dark>
                Talk to sales
              </Pill>
            </div>

            <p className="text-[#B7CFC7]/60 text-[11.5px] sm:text-[12px] mt-4 sm:mt-5">
              Free 14 day trial · No card required · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};