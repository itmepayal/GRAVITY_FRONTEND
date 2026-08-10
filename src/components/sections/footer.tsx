import { ArrowUp } from "lucide-react";
import { scrollToId } from "@/utills/scroll-to-id";
import { GravityMark } from "@/components/common/logo";
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
    <footer className="relative bg-[#0F2D29] text-white py-12 sm:py-16 border-t border-white/10">
      {/* Scroll to Top Floating Button */}
      <button
        onClick={handleTopClick}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-11 h-11 bg-[#0F2D29] border border-[#8FE3C4]/30 text-[#8FE3C4] hover:bg-[#8FE3C4] hover:text-[#0F2D29] transition-all shadow-xl"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 text-center md:text-left">
          
          {/* Brand Info */}
          <div className="max-w-[380px] flex flex-col items-center md:items-start space-y-3">
            <a
              href="#top"
              onClick={handleTopClick}
              className="flex items-center gap-2.5 text-[18px] font-extrabold font-['Goldman',sans-serif] text-white"
            >
              <GravityMark className="w-7 h-7 shrink-0" />
              <span>Gravity TMS</span>
            </a>
            <p className="text-[13px] leading-relaxed text-[#B7CFC7]">
              Enterprise Task Management System. Dependency-aware planning, agile sprint tracking, and zero-code workflow automations for engineering teams.
            </p>
          </div>

          {/* Nav Links */}
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-3"
          >
            {NAV_LINKS.map(function ([id, label]) {
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={go(id)}
                  className="text-[13px] font-bold text-[#B7CFC7] hover:text-white transition-colors"
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
          <p className="text-[12px] font-medium text-[#B7CFC7]">
            © {new Date().getFullYear()} Gravity TMS. All rights reserved.
          </p>
          <a
            href="https://itme-payal.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-semibold text-[#B7CFC7] hover:text-[#8FE3C4] transition-colors"
          >
            Design & Engineering by <span className="underline decoration-[#8FE3C4]">Payal Yadav</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
