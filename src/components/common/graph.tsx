import { useState, useEffect } from "react";
import { COLORS, EDGES, NODES, STATUS_LIST } from "@/constants";
import type { DepNode } from "@/types";
import { LANDING_PROJECT } from "@/constants/task/landingData";

export const DependencyGraph = () => {
  const [revealed, setRevealed] = useState<number>(0);

  useEffect(() => {
    const t = setInterval(() => {
      setRevealed((r) => (r < EDGES.length ? r + 1 : r));
    }, 260);
    return () => clearInterval(t);
  }, []);

  const nodeById = (id: string): DepNode | undefined =>
    NODES.find((n) => n.id === id);

  return (
    <div className="border border-white/8 bg-[#143631] p-5 shadow-[0_20px_48px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-[#B7CFC7]">
          Task dependency graph — {LANDING_PROJECT.name}
        </span>
        <span className="flex items-center gap-1.5 bg-[#8FE3C4]/10 px-2.5 py-1 text-[10px] text-[#8FE3C4]">
          <span className="h-1.5 w-1.5 animate-pulse bg-[#8FE3C4]" />
          Live
        </span>
      </div>

      <svg viewBox="0 0 100 100" className="h-[240px] w-full">
        {EDGES.map(([from, to], i) => {
          const a = nodeById(from);
          const b = nodeById(to);
          if (!a || !b) return null;
          const show = i < revealed;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="0.6"
              strokeDasharray="2 2"
              style={{
                opacity: show ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            />
          );
        })}

        {NODES.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.status === "active" ? 3.6 : 3}
              fill={COLORS[n.status]}
              stroke="#143631"
              strokeWidth="1"
            >
              {n.status === "active" && (
                <animate
                  attributeName="r"
                  values="3.2;4.4;3.2"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <text
              x={n.x}
              y={n.y + 8}
              textAnchor="middle"
              fontSize="3.2"
              fill="#B7CFC7"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
        {STATUS_LIST.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2"
              style={{ background: COLORS[s] }}
            />
            <span className="text-[10px] capitalize text-[#B7CFC7]">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
