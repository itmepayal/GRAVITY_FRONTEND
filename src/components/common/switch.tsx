import { PAD, THUMB, TRACK_H, TRACK_W } from "@/constants";
import { Check } from "lucide-react";

export const Switch = ({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label}
      style={{
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: TRACK_H,
        background: on ? "rgba(143,227,196,0.18)" : "transparent",
        border: `1.5px solid ${on ? "#8FE3C4" : "rgba(255,255,255,0.25)"}`,
        position: "relative",
        flexShrink: 0,
        cursor: "pointer",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: PAD - 1,
          left: on ? TRACK_W - THUMB - PAD : PAD,
          width: THUMB,
          height: THUMB,
          borderRadius: "9999px",
          background: on ? "#8FE3C4" : "rgba(255,255,255,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "left 0.2s ease, background 0.2s ease",
        }}
      >
        {on && <Check size={11} color="#0F2D29" strokeWidth={3} />}
      </span>
    </button>
  );
};