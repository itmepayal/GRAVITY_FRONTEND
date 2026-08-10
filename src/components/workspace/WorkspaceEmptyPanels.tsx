import React from "react";
import { Building2, Plus, Sparkles } from "lucide-react";

export const SidebarEmpty = ({ onCreate }: { onCreate: () => void }) => (
  <div className="px-4 py-10 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center bg-[#0F2D29]/10 text-[#0F2D29]">
      <Building2 size={22} />
    </div>
    <p className="text-[14px] font-bold font-['Goldman',sans-serif] text-[#0F2D29]">No workspaces yet</p>
    <p className="mt-1 text-[12px] font-medium text-[#5B6E68]">
      Create your first space to organize projects and teammates.
    </p>
    <button
      onClick={onCreate}
      className="mt-4 inline-flex items-center gap-1.5 bg-[#0F2D29] px-4 py-2 text-[12.5px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
    >
      <Plus size={14} strokeWidth={2.5} />
      Create workspace
    </button>
  </div>
);

export const EmptyPanel = ({ onCreate }: { onCreate: () => void }) => (
  <div className="relative flex min-h-115 flex-col items-center justify-center border border-dashed border-[#0F2D29]/20 bg-white px-6 py-16 text-center shadow-2xs">
    <div className="relative mb-5 flex h-16 w-16 items-center justify-center border border-[#0F2D29]/20 bg-[#0F2D29]/5 text-[#0F2D29]">
      <Building2 size={28} />
    </div>
    <h2 className="relative text-[18px] font-bold font-['Goldman',sans-serif] tracking-tight text-[#0F2D29]">
      Select a Workspace
    </h2>
    <p className="relative mt-2 max-w-sm text-[13px] leading-relaxed font-medium text-[#5B6E68]">
      Choose a workspace from the sidebar to manage projects, teammates, custom
      roles, and activity logs — or create a brand new space.
    </p>
    <button
      onClick={onCreate}
      className="relative mt-6 inline-flex items-center gap-2 bg-[#0F2D29] px-5 py-2.5 text-[13px] font-bold font-['Goldman',sans-serif] text-white shadow-2xs hover:bg-[#081E1B] transition"
    >
      <Sparkles size={15} />
      Create workspace
    </button>
  </div>
);
