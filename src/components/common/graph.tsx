import { useState, useEffect } from "react";
import { COLORS, EDGES, NODES, STATUS_LIST } from "@/constants";
import type { DepNode } from "@/types";

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
    <div className="bg-[#143631] rounded-2xl p-5 shadow-[0_30px_60px_rgba(0,0,0,0.35)] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10.5px] font-semibold text-[#B7CFC7] uppercase tracking-wide">
          Dependency graph — Launch v2.3
        </span>

        <span className="flex items-center gap-1.5 text-[10px] text-[#8FE3C4] bg-[#8FE3C4]/10 rounded-md px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8FE3C4] animate-pulse" />
          Live
        </span>
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-[240px]">
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

      <div className="flex items-center gap-4 mt-3 px-1">
        {STATUS_LIST.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS[s] }}
            />
            <span className="text-[10px] text-[#B7CFC7] capitalize">
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};