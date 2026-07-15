import { useEffect, useRef, useState } from "react";

export function useCountUp(value: string, shouldRun: boolean, duration = 1400) {
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