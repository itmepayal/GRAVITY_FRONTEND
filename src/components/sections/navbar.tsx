import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
} from "lucide-react";
import { NAV_LINKS } from "@/constants";
import { useScrollProgress } from "@/hooks/use-scroll";
import { useActiveSection } from "@/hooks/use-active";
import { scrollToId } from "@/utills/scroll-to-id";
import { Pill } from "@/components/common/pill";
import { GravityMark } from "@/components/common/logo";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progress = useScrollProgress();
  const activeId = useActiveSection(NAV_LINKS.map(([id]) => id));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const go =
    (id: string) =>
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setOpen(false);
      scrollToId(id);
      history.replaceState(null, "", `#${id}`);
    };

  return (
    <header
      className={`sticky top-0 z-30 bg-[#0F2D29]/95 backdrop-blur-md border-b transition-colors duration-200 ${
        scrolled ? "border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.25)]" : "border-white/5"
      }`}
    >
      <nav className="flex items-center justify-between max-w-[1400px] mx-auto px-3 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40 py-2.5 sm:py-3.5">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            history.replaceState(null, "", "#top");
          }}
          className="flex items-center gap-1.5 sm:gap-2.5 text-base sm:text-xl font-semibold text-white shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4]"
        >
          <GravityMark className="w-[22px] h-[22px] sm:w-[30px] sm:h-[30px] shrink-0" />
          <span className="truncate">Gravity</span>
        </a>

        <div className="hidden md:flex gap-4 lg:gap-8 text-[13px] lg:text-[13.5px] font-medium text-white/70">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              aria-current={activeId === id ? "true" : undefined}
              className={`relative py-1.5 whitespace-nowrap transition-colors duration-150 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4] rounded-sm ${
                activeId === id ? "text-white" : "hover:text-white"
              }`}
            >
              {label}
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-[#8FE3C4] transition-all duration-200 ${
                  activeId === id ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Pill icon href="/login">
            Sign In
          </Pill>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8FE3C4] shrink-0 -mr-1"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div className="h-[2px] bg-white/5">
        <div
          className="h-full bg-[#8FE3C4] transition-[width] duration-[80ms] ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-b border-white/5 ${
          open ? "max-h-[calc(100vh-56px)] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 flex flex-col gap-0.5 sm:gap-1 bg-[#0F2D29] max-h-[calc(100vh-56px)] overflow-y-auto">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className={`text-[15px] font-medium py-3.5 sm:py-3 border-b border-white/5 last:border-b-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FE3C4] rounded-sm ${
                activeId === id ? "text-white" : "text-white/80 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-2.5 mt-4">
            <Pill icon href="/login" className="w-full justify-center">
              Sign In
            </Pill>
          </div>
        </div>
      </div>
    </header>
  );
};