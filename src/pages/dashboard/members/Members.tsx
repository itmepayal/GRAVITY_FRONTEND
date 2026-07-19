import { Mail, MoreHorizontal, UserPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { MOCK_MEMBERS } from "@/constants/dashboard";

const ROLE_STYLES: Record<string, string> = {
  Owner: "bg-[#8FE3C4]/15 text-[#0F8A65]",
  Admin: "bg-[#3FA9F5]/12 text-[#1B79C4]",
  Member: "bg-[#9AA6A1]/12 text-[#5B6E68]",
};

export default function Members() {
  const { openMobileNav } = useDashboardContext();

  return (
    <>
      <Topbar
        title="Members"
        subtitle={`${MOCK_MEMBERS.length} people in this workspace`}
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        <div className="flex items-center justify-end">
          <button className="flex items-center gap-1.5 bg-[#0F2D29] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#0F2D29]/90 transition-colors">
            <UserPlus size={15} />
            Invite member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MOCK_MEMBERS.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-[#0F2D29]/8 p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-[#0F2D29]"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        m.status === "online" ? "bg-[#8FE3C4]" : "bg-[#B7CFC7]"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0F2D29] text-[13.5px] font-semibold truncate">
                      {m.name}
                    </p>
                    <p className="text-[#5B6E68] text-[12px] truncate flex items-center gap-1">
                      <Mail size={11} className="shrink-0" />
                      {m.email}
                    </p>
                  </div>
                </div>
                <button
                  className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-[#8FA69E] hover:bg-[#0F2D29]/5 hover:text-[#0F2D29]"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#0F2D29]/6">
                <span
                  className={`text-[11px] font-medium px-2 py-1 rounded-full ${ROLE_STYLES[m.role]}`}
                >
                  {m.role}
                </span>
                <span className="text-[12px] text-[#5B6E68]">
                  <strong className="text-[#0F2D29] font-semibold">
                    {m.tasksActive}
                  </strong>{" "}
                  active {m.tasksActive === 1 ? "task" : "tasks"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
