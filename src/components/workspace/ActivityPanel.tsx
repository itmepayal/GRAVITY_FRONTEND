import { Activity } from "lucide-react";
import type { ActivityItem } from "./types";
import { SharedHelpers } from "./SharedHelpers";

const { PanelEmpty } = SharedHelpers;

interface ActivityPanelProps {
  activityLog: ActivityItem[];
}

export const ActivityPanel = ({ activityLog }: ActivityPanelProps) => {
  if (activityLog.length === 0) {
    return (
      <PanelEmpty
        icon={Activity}
        title="No activity recorded yet"
        hint="Actions like project creations, member invites, and role edits will appear here."
      />
    );
  }

  return (
    <div className="rounded-xl border border-[#0F2D29]/10 bg-white p-5 shadow-2xs">
      <h4 className="mb-4 text-[14px] font-bold text-[#0F2D29] flex items-center gap-2">
        <Activity size={16} className="text-[#0F8A65]" />
        Workspace Activity Stream
      </h4>

      <ul className="relative border-l border-[#0F2D29]/10 ml-3 space-y-5">
        {activityLog.map((act) => (
          <li key={act.id} className="relative pl-6">
            <span className="absolute -left-2.25 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8FE3C4] ring-4 ring-white" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <p className="text-[13px] text-[#0F2D29]">
                <span className="font-bold">{act.user}</span>{" "}
                <span className="text-[#5B6E68]">{act.action}</span>{" "}
                <span className="font-bold text-[#0F8A65]">{act.target}</span>
              </p>
              <span className="text-[11px] text-[#8FA69E] shrink-0">
                {act.timestamp}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
