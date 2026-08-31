import {
  Building2,
  Bell,
  Mail,
  Monitor,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { FONT_GOLDMAN, FONT_POPPINS } from "@/components/common/design-system";
import { getInitials } from "@/components/settings/settings.utils";
import {
  useCurrentUser,
  useGetSessions,
  useGetUserWorkspaces,
} from "@/hooks/queries/settings";

export function SettingsProfileBanner({
  notificationSummary = "All alerts on",
}: {
  notificationSummary?: string;
}) {
  const { data: user, isLoading } = useCurrentUser();
  const { data: sessions = [] } = useGetSessions();
  const { data: workspacesResponse } = useGetUserWorkspaces();
  const workspaceCount = workspacesResponse?.data?.length ?? 0;
  const is2FAEnabled = user?.is2FAEnabled ?? false;

  if (isLoading) {
    return (
      <div className="h-[120px] animate-pulse rounded-2xl border border-[#0F2D29]/10 bg-[#0F2D29]/5" />
    );
  }

  const stats = [
    { label: "Sessions", value: sessions.length, icon: Monitor },
    { label: "Workspaces", value: workspaceCount, icon: Building2 },
    { label: "Alerts", value: notificationSummary, icon: Bell, isText: true },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#0F2D29]/12 bg-gradient-to-br from-[#0F2D29] via-[#13443D] to-[#0F2D29] px-5 py-4 shadow-md sm:px-6">
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#8FE3C4]/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-[#8FE3C4]/30"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#8FE3C4] text-[18px] font-bold text-[#0F2D29]">
              {getInitials(user?.name)}
            </div>
          )}

          <div className="min-w-0">
            <h2
              className={`truncate text-[18px] font-extrabold text-white sm:text-[20px] ${FONT_GOLDMAN}`}
            >
              {user?.name ?? "Your Account"}
            </h2>
            <p
              className={`mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-white/65 ${FONT_POPPINS}`}
            >
              <Mail size={12} className="shrink-0" />
              {user?.email ?? "—"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge
                label={user?.isEmailVerified ? "Verified" : "Unverified"}
                variant={user?.isEmailVerified ? "success" : "warning"}
              />
              <Badge
                label={user?.authProvider === "google" ? "Google" : "Email"}
              />
              <Badge
                label={`2FA ${is2FAEnabled ? "On" : "Off"}`}
                icon={is2FAEnabled ? ShieldCheck : ShieldOff}
                variant={is2FAEnabled ? "success" : "muted"}
              />
            </div>
          </div>
        </div>

        <div className="grid w-full shrink-0 grid-cols-3 gap-2 sm:w-auto sm:min-w-[300px] sm:max-w-[360px]">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isTextStat = "isText" in stat && stat.isText;

            return (
              <div
                key={stat.label}
                className="flex min-h-[72px] flex-col justify-between rounded-xl border border-white/10 bg-white/8 px-3 py-2.5 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-1">
                  <Icon size={12} className="shrink-0 text-[#8FE3C4]" />
                  <span
                    className={`text-right font-extrabold leading-tight text-white ${FONT_GOLDMAN} ${
                      isTextStat
                        ? "line-clamp-2 text-[10px]"
                        : "text-[18px] tabular-nums"
                    }`}
                  >
                    {stat.value}
                  </span>
                </div>
                <p
                  className={`mt-2 text-[9.5px] font-semibold uppercase tracking-wide text-white/50 ${FONT_POPPINS}`}
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Badge({
  label,
  icon: Icon,
  variant = "muted",
}: {
  label: string;
  icon?: typeof ShieldCheck;
  variant?: "success" | "warning" | "muted";
}) {
  const styles = {
    success: "border-[#8FE3C4]/30 bg-[#8FE3C4]/15 text-[#8FE3C4]",
    warning: "border-[#E98A57]/30 bg-[#E98A57]/15 text-[#E98A57]",
    muted: "border-white/15 bg-white/10 text-white/70",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${FONT_GOLDMAN} ${styles[variant]}`}
    >
      {Icon && <Icon size={10} />}
      {label}
    </span>
  );
}
