import { Topbar } from "@/components/layout/Topbar";
import { useDashboardContext } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth.store";
import { MOCK_TASKS, STATUS_STYLES } from "@/constants/dashboard";
import { ArrowUpRight, GitBranch, Clock, Users2, Activity } from "lucide-react";

const STATS = [
  { label: "Dependencies tracked", value: "3.2M", icon: GitBranch },
  { label: "Fewer schedule slips", value: "41%", icon: Clock },
  { label: "Teams onboarded", value: "12,400", icon: Users2 },
  { label: "Uptime, last 12 months", value: "98.7%", icon: Activity },
];

const GRAPH_NODES = [
  { id: "auth", label: "Auth service", x: 50, y: 12, status: "done" },
  { id: "schema", label: "Schema", x: 14, y: 46, status: "done" },
  { id: "web", label: "Web client", x: 50, y: 46, status: "active" },
  { id: "launch", label: "Launch", x: 86, y: 46, status: "pending" },
  { id: "billing", label: "Billing API", x: 22, y: 80, status: "done" },
  { id: "mobile", label: "Mobile client", x: 50, y: 80, status: "blocked" },
] as const;

const EDGES: [string, string][] = [
  ["auth", "schema"],
  ["auth", "web"],
  ["schema", "billing"],
  ["web", "mobile"],
  ["web", "launch"],
];

const nodeById = (id: string) => GRAPH_NODES.find((n) => n.id === id)!;

export default function Dashboard() {
  const { openMobileNav } = useDashboardContext();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Launch v2.3 — dependency overview"
        onMenuClick={openMobileNav}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div>
          <h2 className="text-[#0F2D29] text-[22px] sm:text-[24px] font-bold tracking-[-0.01em]">
            Welcome back, {firstName}
          </h2>
          <p className="text-[#5B6E68] text-[13.5px] mt-1">
            Here's what's moving — and what's stuck — across your team today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-[#0F2D29]/8 p-4 sm:p-5 flex flex-col gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-[#8FE3C4]/15 flex items-center justify-center text-[#0F8A65]">
                <Icon size={16} />
              </div>
              <div>
                <p className="text-[#0F2D29] text-[20px] sm:text-[22px] font-bold tracking-[-0.01em]">
                  {value}
                </p>
                <p className="text-[#5B6E68] text-[12px] mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 sm:gap-6">
          {/* Dependency graph */}
          <div className="bg-[#0F2D29] rounded-2xl p-5 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.08em] text-[#B7CFC7] font-medium">
                  Dependency graph
                </p>
                <p className="text-white text-[15px] font-semibold mt-0.5">
                  Launch v2.3
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-[#8FE3C4] bg-[#8FE3C4]/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] animate-pulse" />
                Live
              </span>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-55 sm:h-65">
              {EDGES.map(([from, to]) => {
                const a = nodeById(from);
                const b = nodeById(to);
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(183,207,199,0.25)"
                    strokeWidth="0.6"
                    strokeDasharray="2 2"
                  />
                );
              })}
              {GRAPH_NODES.map((n) => (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={2.6}
                    className={STATUS_STYLES[n.status].dot}
                    fill="currentColor"
                    style={{
                      color:
                        n.status === "done"
                          ? "#8FE3C4"
                          : n.status === "active"
                            ? "#3FA9F5"
                            : n.status === "blocked"
                              ? "#E98A57"
                              : "#9AA6A1",
                    }}
                  />
                  <text
                    x={n.x}
                    y={n.y + 6.5}
                    textAnchor="middle"
                    fontSize="3"
                    fill="#B7CFC7"
                  >
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-4 border-t border-white/8">
              {(["done", "active", "blocked", "pending"] as const).map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 text-[11px] text-[#B7CFC7]"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[s].dot}`}
                  />
                  {STATUS_STYLES[s].label}
                </span>
              ))}
            </div>
          </div>

          {/* Task feed */}
          <div className="bg-white rounded-2xl border border-[#0F2D29]/8 p-5 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#0F2D29] text-[14.5px] font-semibold">
                Needs attention
              </h3>
              <a
                href="/dashboard/tasks"
                className="text-[12px] text-[#0F8A65] font-medium flex items-center gap-1 hover:text-[#0F8A65]/80"
              >
                View all
                <ArrowUpRight size={13} />
              </a>
            </div>
            <div className="flex flex-col gap-1">
              {MOCK_TASKS.slice(0, 4).map((task) => {
                const s = STATUS_STYLES[task.status];
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-2.5 border-b border-[#0F2D29]/6 last:border-b-0"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[#0F2D29] text-[13px] font-medium truncate">
                        {task.title}
                      </p>
                      <p className="text-[#5B6E68] text-[11.5px] truncate">
                        {task.project} · Due {task.due}
                      </p>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9.5px] font-semibold text-[#0F2D29]"
                      style={{ backgroundColor: task.assignee.color }}
                      title={task.assignee.name}
                    >
                      {task.assignee.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
