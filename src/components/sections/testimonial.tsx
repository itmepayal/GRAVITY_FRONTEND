import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "../common/reveal";
import { Badge } from "../common/badge";
import { TESTIMONIALS } from "@/constants/testimonial";
import { useVisibleCount } from "@/hooks/use-visible";
import { AUTOPLAY_MS } from "@/constants";

export const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = TESTIMONIALS.length;
  const visible = useVisibleCount();
  const maxIndex = Math.max(0, count - visible);
  const slideWidth = 100 / visible;

  const centerPos = Math.min(index + Math.floor((visible - 1) / 2), count - 1);
  const go = useCallback(
    (next: number) => setIndex(((next % (maxIndex + 1)) + (maxIndex + 1)) % (maxIndex + 1)),
    [maxIndex],
  );

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduce || maxIndex === 0) return;
    timerRef.current = setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, paused, go, maxIndex]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    setPaused(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null || !trackRef.current) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
    trackRef.current.style.transition = "none";
    trackRef.current.style.transform = `translateX(calc(-${index * slideWidth}% + ${dragDeltaX.current}px))`;
  };

  const endDrag = () => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = "";
    trackRef.current.style.transform = "";
    const threshold = 60;
    if (dragDeltaX.current > threshold) go(index - 1);
    else if (dragDeltaX.current < -threshold) go(index + 1);
    dragStartX.current = null;
    dragDeltaX.current = 0;
    setPaused(false);
  };

  return (
    <section id="testimonials" className="bg-[#FBF3E6]">
        <div className="max-w-[1400px] mx-auto py-6 sm:py-8 md:py-9 lg:py-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <Badge eyebrow="Our customers" title="Teams that stopped guessing at the ship date" />
        <Reveal delay={100}>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="overflow-hidden rounded-xl sm:rounded-2xl touch-pan-y"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={() => dragStartX.current !== null && endDrag()}
            >
              <div
                ref={trackRef}
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${index * slideWidth}%)` }}
              >
                {TESTIMONIALS.map((t, i) => {
                  const isDark = i === centerPos;
                  return (
                    <div
                      key={t.name}
                      className="shrink-0 px-1.5 sm:px-2"
                      style={{ width: `${slideWidth}%` }}
                    >
                      <div
                        className={`rounded-xl sm:rounded-2xl p-5 sm:p-6 flex flex-col h-full min-h-[220px] sm:min-h-[240px] transition-colors duration-300 ${
                          isDark ? "bg-[#0F2D29]" : "bg-white border border-[#0F2D29]/8"
                        }`}
                      >
                        <span
                          className={`text-[28px] sm:text-[32px] leading-none mb-2 font-bold ${
                            isDark ? "text-[#8FE3C4]/50" : "text-[#3FA787]/30"
                          }`}
                        >
                          "
                        </span>
                        <p
                          className={`text-[13.5px] sm:text-[14px] leading-relaxed mb-6 flex-1 ${
                            isDark ? "text-white" : "text-[#0F2D29]"
                          }`}
                        >
                          {t.quote}
                        </p>
                        <div>
                          <div className={`text-[13px] font-semibold ${isDark ? "text-white" : "text-[#0F2D29]"}`}>
                            {t.name}
                          </div>
                          <div className={`text-[11px] ${isDark ? "text-[#B7CFC7]" : "text-[#5E6D68]"}`}>
                            {t.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {maxIndex > 0 && (
              <>
                <button
                  onClick={() => go(index - 1)}
                  aria-label="Previous testimonial"
                  className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#0F2D29]/10 shadow-sm flex items-center justify-center text-[#0F2D29] hover:bg-[#0F2D29] hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => go(index + 1)}
                  aria-label="Next testimonial"
                  className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#0F2D29]/10 shadow-sm flex items-center justify-center text-[#0F2D29] hover:bg-[#0F2D29] hover:text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {maxIndex > 0 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className="p-1.5 -m-1.5"
                >
                  <span
                    className={`block transition-all duration-200 ${
                      i === index ? "w-2 h-2 bg-[#0f2d29]" : "w-2 h-2 bg-[#0F2D29]/15"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
};