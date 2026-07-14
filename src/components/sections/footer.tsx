import { ArrowUp } from "lucide-react";
import { scrollToId } from "@/utills/scroll-to-id";
import GravityMark from "../common/logo";
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
    <footer className="relative bg-[#0F2D29]/95 py-8 sm:py-10 md:py-12 lg:py-14 border-t border-white/5">
      <button
        onClick={handleTopClick}
        aria-label="Back to top"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0F2D29] border border-white/10 text-[#B7CFC7] hover:text-[#8FE3C4] hover:border-[#8FE3C4] shadow-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4]"
      >
        <ArrowUp size={16} className="sm:hidden" />
        <ArrowUp size={18} className="hidden sm:block" />
      </button>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-40">
        <div className="flex flex-col gap-8 sm:gap-9 md:flex-row md:items-start md:justify-between text-center md:text-left items-center md:items-start">
          <div className="max-w-[380px] w-full md:w-auto flex flex-col items-center md:items-start">
            <a
              href="#top"
              onClick={handleTopClick}
              className="flex items-center gap-2.5 text-[15px] sm:text-[16px] font-bold text-white mb-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4] w-fit"
            >
              <GravityMark className="w-6 h-6 sm:w-[26px] sm:h-[26px] shrink-0" />
              Gravity
            </a>
            <p className="text-[13px] leading-relaxed text-[#B7CFC7] max-w-[320px]">
              Dependency-aware planning for teams that can't afford a surprise
              on launch day.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center md:justify-start gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-3 sm:gap-y-4 w-full md:w-auto"
          >
            {NAV_LINKS.map(function ([id, label]) {
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={go(id)}
                  className="text-[13px] text-[#B7CFC7] hover:text-white transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4]"
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>
        <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 text-center sm:text-left">
          <p className="text-[11px] sm:text-[12px] text-[#5E6D68] order-2 sm:order-1">
            © {new Date().getFullYear()} Gravity. All rights reserved.
          </p>
          <a
            href="https://itme-payal.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] sm:text-[12px] text-[#5E6D68] transition-colors order-1 sm:order-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FE3C4] w-fit mx-auto sm:mx-0"
          >
            Design and Development by{" "}
            <span className="hover:text-[#8FE3C4]">Payal Yadav</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
