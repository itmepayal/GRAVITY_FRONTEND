import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { NAV_LINKS } from "@/constants";
import { useScrollProgress } from "@/hooks/use-scroll";
import { useActiveSection } from "@/hooks/use-active";
import { scrollToId } from "@/utills/scroll-to-id";
import { GravityMark } from "@/components/common/logo";
import { useAuthStore } from "@/store/auth.store";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeId = useActiveSection(NAV_LINKS.map(([id]) => id));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const authHref = isAuthenticated ? "/dashboard" : "/login";
  const authLabel = isAuthenticated ? "Go to Dashboard" : "Sign In";

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

  const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-[#0F2D29]/95 backdrop-blur-md border-b transition-colors duration-200 ${
        scrolled
          ? "border-[#8FE3C4]/20 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
          : "border-white/10"
      }`}
    >
      <nav className="flex items-center justify-between max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3.5">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            history.replaceState(null, "", "#top");
          }}
          className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold font-['Goldman',sans-serif] text-white shrink-0 tracking-tight"
        >
          <GravityMark className="w-7 h-7 shrink-0" />
          <span className="truncate">Gravity <span className="text-[#8FE3C4] font-bold font-['Poppins',sans-serif] text-[12px] uppercase tracking-wider ml-1 border border-[#8FE3C4]/30 px-1.5 py-0.5">TMS</span></span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 lg:gap-8 text-sm font-semibold font-['Poppins',sans-serif] text-[#B7CFC7]">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className={`relative py-1 transition-colors group ${
                activeId === id ? "text-white" : "hover:text-white"
              }`}
            >
              {label}
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 bg-[#8FE3C4] transition-all duration-200 ${
                  activeId === id ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          ))}
        </div>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to={authHref}
            className="flex items-center gap-2 bg-[#8FE3C4] text-[#0F2D29] px-5 py-2.5 text-[13px] font-extrabold tracking-wide hover:bg-white transition"
          >
            {authLabel}
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex h-9 w-9 items-center justify-center border border-white/20 text-white hover:bg-white/10"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-b border-white/10 bg-[#0F2D29] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {NAV_LINKS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={go(id)}
                className="text-[15px] font-bold text-[#B7CFC7] hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="pt-2">
            <Link
              to={authHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#8FE3C4] text-[#0F2D29] py-3 text-[14px] font-extrabold"
            >
              {authLabel}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
