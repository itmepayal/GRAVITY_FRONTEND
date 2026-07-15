import { Highlight } from "../common/highlight";
import { Pill } from "../common/pill";

export const Cta = () => {
  return (
    <section className="bg-[#0F2D29] text-center relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <h2 className="text-white text-[30px] font-bold mb-4 leading-tight">
          Put your next launch on a{" "}
          <Highlight>
            <span className="capitalize">real</span>
          </Highlight>{" "}
          schedule
        </h2>

        <p className="text-[#B7CFC7] text-[15px] mb-8">
          Map your first dependency graph in under five minutes. No credit card
          required.
        </p>

        <div className="flex justify-center gap-3">
          <Pill icon>Get started free</Pill>
          <Pill variant="outline" dark>
            Talk to sales
          </Pill>
        </div>
      </div>
    </section>
  );
};