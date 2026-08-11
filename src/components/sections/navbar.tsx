import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { NAV_LINKS } from "@/constants";
import { useActiveSection } from "@/hooks/use-active";
import { scrollToId } from "@/utills/scroll-to-id";
import { GravityBrand } from "@/components/common/logo";
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
      className={`sticky top-0 z-40 border-b bg-[#0F2D29]/95 backdrop-blur-md transition-all duration-200 ${
        scrolled
          ? "border-[#8FE3C4]/20 shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
          : "border-white/10"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3.5 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            history.replaceState(null, "", "#top");
          }}
          className="shrink-0"
        >
          <GravityBrand size={28} showTag />
        </a>

        <div className="hidden gap-6 text-sm font-semibold text-[#B7CFC7] md:flex lg:gap-8">
          {NAV_LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={go(id)}
              className={`group relative py-1 transition-colors ${
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

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <Link
            to={authHref}
            className="flex items-center gap-2 bg-[#8FE3C4] px-5 py-2.5 text-[13px] font-extrabold tracking-wide text-[#0F2D29] transition hover:bg-white"
          >
            {authLabel}
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center border border-white/20 text-white hover:bg-white/10 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="space-y-4 border-b border-white/10 bg-[#0F2D29] px-6 py-6 md:hidden">
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
          <Link
            to={authHref}
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 bg-[#8FE3C4] py-3 text-[14px] font-extrabold text-[#0F2D29]"
          >
            {authLabel}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      )}
    </header>
  );
};
