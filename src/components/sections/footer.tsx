import { ArrowUp } from "lucide-react";
import { scrollToId } from "@/utills/scroll-to-id";
import { GravityBrand } from "@/components/common/logo";
import { NAV_LINKS } from "@/constants";

export const Footer = () => {
  function go(id: string) {
    return function (e: React.MouseEvent) {
      e.preventDefault();
      scrollToId(id);
      history.replaceState(null, "", `#${id}`);
    };
  }

  function handleTopClick(e: React.MouseEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", "#top");
  }

  return (
    <footer className="relative border-t border-white/10 bg-[#0F2D29] py-12 text-white sm:py-16">
      <button
        onClick={handleTopClick}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center border border-[#8FE3C4]/30 bg-[#0F2D29] text-[#8FE3C4] shadow-xl transition-all hover:bg-[#8FE3C4] hover:text-[#0F2D29]"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="mx-auto flex max-w-[400px] flex-col items-center space-y-3 md:mx-0 md:items-start">
            <a href="#top" onClick={handleTopClick}>
              <GravityBrand size={28} showTag />
            </a>
            <p className="text-[13px] leading-relaxed text-[#B7CFC7]">
              Enterprise Task Management System — Kanban boards, sprint tracking,
              subtasks, dependency graphs, and workspace RBAC for engineering
              teams.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 md:justify-start"
          >
            {NAV_LINKS.map(function ([id, label]) {
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={go(id)}
                  className="text-[13px] font-bold text-[#B7CFC7] transition-colors hover:text-white"
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-[12px] font-medium text-[#B7CFC7]">
            © {new Date().getFullYear()} Gravity TMS. All rights reserved.
          </p>
          <a
            href="https://itme-payal.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-semibold text-[#B7CFC7] transition-colors hover:text-[#8FE3C4]"
          >
            Design & Engineering by{" "}
            <span className="underline decoration-[#8FE3C4]">Payal Yadav</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
