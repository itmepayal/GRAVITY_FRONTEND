import { ChevronRight, Lock, Globe, Building2 } from "lucide-react";
import { type Workspace, type Member, ROLE_META, initials } from "./types";

interface WorkspaceListItemProps {
  workspace: Workspace;
  active: boolean;
  onSelect: () => void;
}

export const WorkspaceListItem = ({
  workspace: ws,
  active,
  onSelect,
}: WorkspaceListItemProps) => {
  const roleMeta = ROLE_META[ws.role] ?? {
    icon: Building2,
    badge: "bg-[#0F2D29]/8 text-[#5B6E68]",
  };
  const RoleIcon = roleMeta.icon;

  return (
    <li>
      <button
        onClick={onSelect}
        className={`group relative flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
          active
            ? "bg-[#0F2D29] text-white shadow-md"
            : "hover:bg-[#0F2D29]/5 hover:shadow-sm active:scale-[0.99]"
        }`}
      >
        {active && (
          <span className="absolute top-3 bottom-3 left-0 w-1.5 rounded-r-full bg-[#8FE3C4]" />
        )}

        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[14px] font-bold shadow-sm ring-2 transition-transform duration-200 group-hover:scale-[1.03] ${
            active ? "text-white ring-white/20" : "text-[#0F2D29] ring-white/60"
          }`}
          style={{ backgroundColor: ws.color || "#6366F1" }}
        >
          {ws.icon || initials(ws.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`truncate text-[13.5px] font-bold ${
                active ? "text-white" : "text-[#0F2D29]"
              }`}
              title={ws.name}
            >
              {ws.name}
            </span>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize ${
                active
                  ? "bg-white/15 text-[#8FE3C4] ring-1 ring-white/10"
                  : roleMeta.badge
              }`}
            >
              <RoleIcon size={9} />
              {ws.role || "member"}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <p
                className={`truncate text-[11px] font-medium ${
                  active ? "text-white/70" : "text-[#8FA69E]"
                }`}
              >
                {ws.projects.length} proj · {ws.members.length} mem
              </p>
              {ws.isPrivate ? (
                <span
                  title="Private Workspace"
                  className="flex shrink-0 items-center"
                >
                  <Lock
                    size={10}
                    className={active ? "text-white/60" : "text-[#8FA69E]"}
                  />
                </span>
              ) : (
                <span
                  title="Public Workspace"
                  className="flex shrink-0 items-center"
                >
                  <Globe
                    size={10}
                    className={active ? "text-white/60" : "text-[#8FA69E]"}
                  />
                </span>
              )}
            </div>

            <AvatarStack
              members={ws.members.slice(0, 3)}
              extra={Math.max(0, ws.members.length - 3)}
              dimmed={active}
            />
          </div>
        </div>

        <ChevronRight
          size={15}
          className={`mt-3 shrink-0 transition ${
            active
              ? "text-[#8FE3C4]"
              : "text-[#8FA69E] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
          }`}
        />
      </button>
    </li>
  );
};

export const AvatarStack = ({
  members,
  extra,
  dimmed,
}: {
  members: Member[];
  extra: number;
  dimmed?: boolean;
}) => (
  <div className="flex items-center shrink-0">
    {members.map((member, index) => (
      <div
        key={member.user.id || index}
        title={member.user?.name || member.user?.email || "Member"}
        className={`relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-2 transition-transform duration-150 hover:z-10 ${
          dimmed
            ? "ring-[#0F2D29] bg-[#0F2D29]"
            : "ring-white bg-white shadow-2xs"
        } ${index > 0 ? "-ml-1.5" : ""}`}
      >
        {member.user?.avatar ? (
          <img
            src={member.user.avatar}
            alt={member.user.name || "Member avatar"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center text-[9px] font-bold font-['Goldman',sans-serif] ${
              dimmed ? "bg-white/20 text-white" : "bg-[#8FE3C4] text-[#0F2D29]"
            }`}
          >
            {initials(member.user?.name || member.user?.email || "?")}
          </div>
        )}
      </div>
    ))}

    {extra > 0 && (
      <div
        className={`-ml-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 text-[8.5px] font-bold font-['Goldman',sans-serif] ${
          dimmed
            ? "bg-white/20 text-white ring-[#0F2D29]"
            : "bg-[#0F2D29]/10 text-[#0F2D29] ring-white shadow-2xs"
        }`}
      >
        +{extra}
      </div>
    )}
  </div>
);
