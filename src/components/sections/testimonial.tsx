import { useState, useRef, useEffect, useCallback } from "react";
import { Reveal } from "@/components/common/reveal";
import { Badge } from "@/components/common/badge";
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
    <section id="resources" className="bg-[#F8F7F3] border-b border-[#0F2D29]/10">
      <div className="max-w-[1400px] mx-auto py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <Badge
          eyebrow="Trusted by Engineering Leaders"
          title="Teams that stopped guessing ship dates with Gravity TMS"
        />
        <Reveal delay={100}>
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="overflow-hidden touch-pan-y"
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
                      className="shrink-0 px-2.5"
                      style={{ width: `${slideWidth}%` }}
                    >
                      <div
                        className={`p-6 sm:p-8 flex flex-col justify-between h-full border transition-colors duration-300 ${
                          isDark
                            ? "bg-[#0F2D29] text-white border-[#0F2D29] shadow-xl"
                            : "bg-white text-[#0F2D29] border-[#0F2D29]/15"
                        }`}
                      >
                        <p
                          className={`text-[14px] sm:text-[15px] leading-relaxed font-medium mb-6 ${
                            isDark ? "text-[#B7CFC7]" : "text-[#5B6E68]"
                          }`}
                        >
                          "{t.quote}"
                        </p>

                        <div>
                          <p
                            className={`text-[15px] font-extrabold ${
                              isDark ? "text-white" : "text-[#0F2D29]"
                            }`}
                          >
                            {t.name}
                          </p>
                          <p
                            className={`text-[12px] font-semibold mt-0.5 ${
                              isDark ? "text-[#8FE3C4]" : "text-[#5B6E68]"
                            }`}
                          >
                            {t.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};