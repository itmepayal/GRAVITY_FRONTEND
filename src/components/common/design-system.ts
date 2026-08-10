/**
 * Enterprise SaaS Design System & Typography Tokens
 * Centralized for Workspaces, Projects, and Tasks modules.
 */

export const FONT_GOLDMAN = "font-['Goldman',sans-serif]";
export const FONT_POPPINS = "font-['Poppins',sans-serif]";

export const THEME_COLORS = {
  emeraldDark: "#0F2D29",
  emeraldHover: "#081E1B",
  mintAccent: "#8FE3C4",
  statusGreen: "#0F8A65",
  textMuted: "#5B6E68",
  textPlaceholder: "#8FA69E",
  borderLight: "rgba(15, 45, 41, 0.15)",
  bgLight: "#F8F7F3",
};

export const COMMON_CLASSES = {
  // Headings & Labels
  headingTitle: `${FONT_GOLDMAN} font-bold text-[#0F2D29]`,
  headingSubtitle: `${FONT_POPPINS} text-[12.5px] font-medium text-[#5B6E68]`,
  labelUppercase: `${FONT_GOLDMAN} text-[12px] font-bold text-[#0F2D29] uppercase tracking-wider block mb-1.5`,

  // Buttons
  btnPrimary: `${FONT_GOLDMAN} bg-[#0F2D29] text-white font-bold px-4 py-2 text-[12.5px] shadow-2xs hover:bg-[#081E1B] transition flex items-center justify-center gap-2 active:scale-[0.99]`,
  btnSecondary: `${FONT_POPPINS} bg-white border border-[#0F2D29]/15 text-[#5B6E68] font-bold px-4 py-2 text-[12.5px] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29] transition flex items-center justify-center gap-2`,
  btnDanger: `${FONT_GOLDMAN} bg-red-600 text-white font-bold px-4 py-2 text-[12.5px] shadow-2xs hover:bg-red-700 transition flex items-center justify-center gap-2 active:scale-[0.99]`,

  // Inputs & Selects
  inputBase: `${FONT_POPPINS} w-full border border-[#0F2D29]/15 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#0F2D29] outline-none transition focus:border-[#0F2D29] placeholder:text-[#8FA69E] placeholder:font-normal`,
  selectBase: `${FONT_GOLDMAN} border border-[#0F2D29]/15 bg-white px-3 py-2 text-[12.5px] font-bold text-[#0F2D29] outline-none cursor-pointer`,

  // Cards & Containers
  cardBase: "border border-[#0F2D29]/15 bg-white p-5 shadow-2xs transition-all duration-200 hover:border-[#0F2D29] hover:shadow-md",
  modalShell: "w-full max-w-md border border-[#0F2D29] bg-white shadow-2xl overflow-hidden",
};
